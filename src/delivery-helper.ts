import type { Camelize, CommitSchema } from '@gitbeaker/rest'
import type { DeliveryState, DeliveryTeam, LastMergeRequestPerProject, ReportTemplateParams } from './types'
import { writeFileSync } from 'node:fs'
import { Gitlab } from '@gitbeaker/rest'
import JiraClient from 'jira-client'
import {
  GITLAB_API_OPTIONS,
  JIRA_API_OPTIONS,
  JIRA_APPLICATION_TYPES,
  JIRA_DATA_TYPES,
  JIRA_ISSUE_TYPES,
  JIRA_PULL_REQUEST_ID_SEPARATOR,
  JIRA_PULL_REQUEST_STATUTES,
  REPORT_FILE_PATH,
  TEAM_GITLAB_TARGET_BRANCH,
  TEAM_JIRA_ISSUE_NUMBER_REGEX,
} from './constants'
import { getReportTemplate } from './report'
import { getMainBranch, getTeamId } from './team'

export class DeliveryHelper {
  private readonly gitlab: InstanceType<typeof Gitlab>
  private readonly jira: InstanceType<typeof JiraClient>
  private projectId?: string
  private team: DeliveryTeam

  constructor(team: string) {
    this.gitlab = new Gitlab(GITLAB_API_OPTIONS)
    this.jira = new JiraClient(JIRA_API_OPTIONS)
    this.team = this.getTeamInfo(team)
  }

  public async run(projectId: string, mergeRequestId: number) {
    await this.setProjectId(projectId)
    await this.checkMergeRequest(mergeRequestId)

    const issueNumbers = {
      gitlab: (await this.getIssueNumbersFromMergeRequest(mergeRequestId)),
      jira: new Set(Array.from(await this.getIssueNumbersToDeliver()).sort()),
    }

    const deliveryState: DeliveryState = {
      'gitlab-ready': [...issueNumbers.gitlab].filter(issueNumber => !issueNumbers.jira.has(issueNumber)).sort(),
      'jira-ready': [...issueNumbers.jira].filter(issueNumber => !issueNumbers.gitlab.has(issueNumber)).sort(),
      'ready': [...issueNumbers.gitlab].filter(issueNumber => issueNumbers.jira.has(issueNumber)).sort(),
    }

    const report = await this.getDeliveryReport(deliveryState)
    this.writeDeliveryReport(report)
    return report
  }

  private async checkMergeRequest(mergeRequestId: number) {
    if (!this.projectId)
      throw new Error('checkMergeRequest: the projectId must be defined')

    let mergeRequest
    try {
      mergeRequest = await this.gitlab.MergeRequests.show(this.projectId!, mergeRequestId)
    }
    catch {
      throw new Error(`checkMergeRequest: the merge request "${mergeRequestId}" doesn't exist in the project ${this.projectId}`)
    }

    const { source_branch, target_branch } = mergeRequest
    const mainBranch = this.team.gitlab.mainBranch
    if (source_branch === mainBranch && target_branch === TEAM_GITLAB_TARGET_BRANCH)
      return
    throw new Error(`checkMergeRequest: the merge request is not a merge request from "${mainBranch}" to "${TEAM_GITLAB_TARGET_BRANCH}"`)
  }

  private async getDeliveryReport(state: DeliveryState) {
    const params: ReportTemplateParams = {
      gitlab: await this.transformIssueNumberToMarkdown(state['gitlab-ready']),
      jira: await this.transformIssueNumberToMarkdown(state['jira-ready']),
      ready: await this.transformIssueNumberToMarkdown(state.ready),
    }

    return getReportTemplate(params)
  }

  private getIssueNumbersFromCommit(commit: CommitSchema | Camelize<CommitSchema>) {
    return new Set([
      ...commit.message.match(TEAM_JIRA_ISSUE_NUMBER_REGEX) ?? [],
      ...commit.title.match(TEAM_JIRA_ISSUE_NUMBER_REGEX) ?? [],
    ])
  }

  private async getIssueNumbersFromMergeRequest(mergeRequestId: number): Promise<Set<string>> {
    if (!this.projectId)
      throw new Error('getIssueNumbersFromMergeRequest: the projectId must be defined')

    const commits = await this.gitlab.MergeRequests.allCommits(this.projectId, mergeRequestId)
    const issueNumbers = commits.reduce((issueNumbers, commit) =>
      new Set([...issueNumbers, ...this.getIssueNumbersFromCommit(commit)]), new Set<string>())

    const promises = Array.from(issueNumbers).sort().map(issueNumber =>
      this.jira.findIssue(issueNumber))

    const responses = await Promise.allSettled(promises)
    return responses.reduce((issueNumbers: Set<string>, response) => {
      if (response.status === 'rejected')
        return issueNumbers

      const { fields, key } = response.value
      if (fields.issuetype.name === JIRA_ISSUE_TYPES.EPIC)
        return issueNumbers

      issueNumbers.add(key)
      return issueNumbers
    }, new Set<string>())
  }

  private async getIssueNumbersToDeliver(): Promise<Set<string>> {
    const issues = await this.selectIssuesToDeliver()
    const { ids, keys } = issues
    const promises = ids.map(this.isReadyToDeliverForProject.bind(this))
    const responses = await Promise.all(promises)
    const issueNumbers = keys.filter((_, index) => responses[index])
    return new Set(issueNumbers)
  }

  private async getLatestMergeRequest(issueId: string): Promise<boolean> {
    if (!this.projectId)
      throw new Error('getLatestMergeRequest: the projectId must be defined')

    const devStatus = await this.jira.getDevStatusDetail(issueId, JIRA_APPLICATION_TYPES.GITLAB, JIRA_DATA_TYPES.PULL_REQUEST)
    if (!devStatus)
      this.triggerUnexpectedResponse('getLatestMergeRequest')

    const { pullRequests: mergeRequests } = devStatus.detail[0]
    if (!mergeRequests)
      this.triggerUnexpectedResponse('getLatestMergeRequest')

    const lastMergeRequestsPerProject: Record<string, LastMergeRequestPerProject> = {}
    const mainBranch = this.team.gitlab.mainBranch
    for (const mergeRequest of mergeRequests) {
      const { status } = mergeRequest
      if (status !== JIRA_PULL_REQUEST_STATUTES.MERGED)
        continue
      const { destination, source } = mergeRequest
      if (destination.branch !== mainBranch && (source.branch !== mainBranch || destination.branch !== TEAM_GITLAB_TARGET_BRANCH))
        continue

      const [projectId, mergeRequestId] = mergeRequest.id.split(JIRA_PULL_REQUEST_ID_SEPARATOR)
      const gitlabMergeRequest = await this.gitlab.MergeRequests.show(projectId, mergeRequestId)
      const { merged_at } = gitlabMergeRequest
      if (typeof merged_at !== 'string')
        continue

      const lastMergeRequestPerProject = lastMergeRequestsPerProject[projectId]
      if (lastMergeRequestPerProject && lastMergeRequestPerProject.mergedAt >= merged_at)
        continue
      lastMergeRequestsPerProject[projectId] = {
        mergedAt: merged_at,
        targetBranch: destination.branch,
      }
    }

    return (lastMergeRequestsPerProject[this.projectId] && lastMergeRequestsPerProject[this.projectId].targetBranch === mainBranch)
      || (Object.values(lastMergeRequestsPerProject).every(mergeRequest => mergeRequest.targetBranch !== mainBranch))
  }

  private async isReadyToDeliverForProject(issueId: string) {
    return this.getLatestMergeRequest(issueId) // rename here
  }

  private async selectIssuesToDeliver(): Promise<{ ids: string[], keys: string[] }> {
    const defaultIssues = { ids: [], keys: [] }

    const JQL = `"Team[Team]" = ${this.team.jira.teamId} and status = "Ready to Deliver" order by key`

    const response = await this.jira.getIssuesForBoard('1', 0, 50, JQL)
    if (!response || !response.issues)
      this.triggerUnexpectedResponse('selectIssuesToDeliver')

    const issues = response.issues ?? []
    return issues.reduce((issues: Record<string, string[]>, { id, key }: { id?: string, key?: string }) => {
      if (!id || !key)
        this.triggerUnexpectedResponse('selectIssuesToDeliver')

      issues.ids.push(id)
      issues.keys.push(key)

      return issues
    }, defaultIssues)
  }

  private async setProjectId(projectId: string) {
    try {
      await this.gitlab.Projects.show(projectId)
    }
    catch {
      throw new Error(`setProjectId: the project "${projectId}" doesn't exist or you do not have enough rights to see it`)
    }
    this.projectId = projectId
  }

  private getTeamInfo(team: string): DeliveryTeam {
    return {
      gitlab: {
        mainBranch: getMainBranch(team),
      },
      jira: {
        teamId: getTeamId(team),
      },
    }
  }

  private transformIssueNumberToURL(issueNumber: string) {
    return `${JIRA_API_OPTIONS.protocol}://${JIRA_API_OPTIONS.host}/browse/${issueNumber}`
  }

  private async transformIssueNumberToMarkdown(issueNumbers: string[]) {
    const promises = issueNumbers.map(issueNumber => this.jira.findIssue(issueNumber))
    const responses = await Promise.all(promises)
    const markdownIssues = responses.map((response) => {
      if (!response || !response.key || !response.fields?.summary)
        this.triggerUnexpectedResponse('transformIssueNumberToMarkdown')

      const { fields, key } = response
      const { summary } = fields
      const url = this.transformIssueNumberToURL(key)

      return `- [[${key}](${url})] ${summary}  `
    })

    return markdownIssues.join('\n')
  }

  private triggerUnexpectedResponse(name: string): never {
    throw new Error(`${name}: unexpected Jira response`)
  }

  private writeDeliveryReport(report: string) {
    writeFileSync(REPORT_FILE_PATH, report, 'utf-8')
  }
}

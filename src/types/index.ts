export interface DeliveryState {
  'gitlab-ready': string[]
  'jira-ready': string[]
  'ready': string[]
}

export interface LastMergeRequestPerProject {
  mergedAt: string
  targetBranch: string
}

export type { ReportTemplateParams } from './report'
export type { DeliveryTeam } from './team'

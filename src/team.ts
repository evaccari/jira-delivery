import { TEAM_GITLAB_MAIN_BRANCHES, TEAM_JIRA_IDS } from './constants/team'
import { checkTeamName } from './typeguards'

export function getMainBranch(team: string) {
  checkTeamName(team)
  return TEAM_GITLAB_MAIN_BRANCHES[team]
}

export function getTeamId(team: string) {
  checkTeamName(team)
  return TEAM_JIRA_IDS[team]
}

import type { TEAM_NAMES } from '../constants/team'

export interface DeliveryTeam {
  gitlab: { mainBranch: string }
  jira: { teamId: string }
}

export type TeamName = typeof TEAM_NAMES[keyof typeof TEAM_NAMES]

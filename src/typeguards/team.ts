import type { TeamName } from '../types/team'
import { TEAM_NAMES } from '../constants/team'
import { createTypeGuard, isValueOf } from './global'

const isTeamName = createTypeGuard<TeamName>((value: unknown) =>
  typeof value === 'string' && isValueOf(TEAM_NAMES)(value) ? value : undefined)

export const checkTeamName: (value: unknown) => asserts value is TeamName = (value: unknown): asserts value is TeamName => {
  if (isTeamName(value))
    return
  throw new Error(`Unsupported team: "${value}"`)
}

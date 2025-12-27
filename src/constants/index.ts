import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export { GITLAB_API_OPTIONS } from './gitlab'
export {
  JIRA_API_OPTIONS,
  JIRA_APPLICATION_TYPES,
  JIRA_DATA_TYPES,
  JIRA_ISSUE_TYPES,
  JIRA_PULL_REQUEST_ID_SEPARATOR,
  JIRA_PULL_REQUEST_STATUTES,
} from './jira'
export { TEAM_GITLAB_TARGET_BRANCH, TEAM_JIRA_ISSUE_NUMBER_REGEX } from './team'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const REPORT_FILE_PATH = resolve(__dirname, '../../output/description.md')

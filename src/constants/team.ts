export const TEAM_NAMES = {
  CORE: 'core',
  CUSTOMER_SERVICE: 'customer-service',
  FOUNDATIONS: 'foundations',
  INTEGRATIONS: 'integrations',
  LEAD: 'lead',
  SALES: 'sales',
} as const

export const TEAM_GITLAB_MAIN_BRANCHES = {
  [TEAM_NAMES.CORE]: 'team/core/main',
  [TEAM_NAMES.CUSTOMER_SERVICE]: 'team/customer-service/main',
  [TEAM_NAMES.FOUNDATIONS]: 'team/foundations/deliver',
  [TEAM_NAMES.INTEGRATIONS]: 'team/integrations/main',
  [TEAM_NAMES.LEAD]: 'team/lead/main',
  [TEAM_NAMES.SALES]: 'team/sales/main',
} as const

export const TEAM_GITLAB_TARGET_BRANCH = 'develop'

export const TEAM_JIRA_IDS = {
  [TEAM_NAMES.CORE]: '57ea6b80-2c07-4e1a-a4ab-d26a2e61bbc6',
  [TEAM_NAMES.CUSTOMER_SERVICE]: '9464e27b-b5e9-4f29-a2b6-25d5e9a2887f',
  [TEAM_NAMES.FOUNDATIONS]: '0fc06100-c837-4594-a6bc-17cce1b139ca',
  [TEAM_NAMES.INTEGRATIONS]: '343c54c9-e470-4573-9d1a-01d07846036c',
  [TEAM_NAMES.LEAD]: '5c15795b-5717-43ff-a028-a69e7127bfee',
  [TEAM_NAMES.SALES]: '8944628a-262c-401d-b9ac-18dfc9a45387',
}

export const TEAM_JIRA_ISSUE_NUMBER_REGEX = /EFU-\d+/g

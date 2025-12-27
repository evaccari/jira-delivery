import type { JiraApiOptions } from 'jira-client'
import process from 'node:process'
import dotenv from 'dotenv'

dotenv.config()

export const JIRA_API_OPTIONS: JiraApiOptions = {
  apiVersion: '2',
  host: process.env.JIRA_HOST || '',
  password: process.env.JIRA_TOKEN || '',
  protocol: 'https',
  strictSSL: true,
  username: process.env.JIRA_EMAIL_ADDRESS || '',
} as const

export const JIRA_APPLICATION_TYPES = {
  GITLAB: 'GitLab',
} as const

export const JIRA_DATA_TYPES = {
  PULL_REQUEST: 'pullrequest',
} as const

export const JIRA_ISSUE_TYPES = {
  EPIC: 'Epic',
} as const

export const JIRA_PULL_REQUEST_STATUTES = {
  MERGED: 'MERGED',
} as const

export const JIRA_PULL_REQUEST_ID_SEPARATOR = '!'

import process from 'node:process'
import dotenv from 'dotenv'

dotenv.config()

export const GITLAB_API_OPTIONS = {
  host: process.env.GITLAB_HOST || '',
  token: process.env.GITLAB_TOKEN || '',
} as const

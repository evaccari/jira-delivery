import type { ReportTemplateParams } from './types'

const title = () => '# Jira issues'

export function getReportTemplate(params: ReportTemplateParams) {
  return `${title()}
${gitlab(params.gitlab)}${jira(params.jira)}${ready(params.ready)}`
}

function gitlab(content: string) {
  return content !== ''
    ? `
## GitLab only
> :warning: Why is the Jira with a status different than "Ready to deliver" and mentioned in the GitLab commits?  

${content}
`
    : ''
}

function jira(content: string) {
  return content !== ''
    ? `
## Jira only
> :warning: Why is the Jira with the status "Ready to deliver" and not mentioned in the GitLab commits?  

${content}
`
    : ''
}

function ready(content: string) {
  return content !== ''
    ? `
## Ready
Everything seems ok BUT a small check in Jira is still relevant!  

${content}`
    : ''
}

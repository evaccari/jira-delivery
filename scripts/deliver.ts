import { ToolCommand } from '../src/commander'
import { REPORT_FILE_PATH } from '../src/constants'
import { DeliveryHelper } from '../src/delivery-helper'

const program = new ToolCommand()

program.description('This tool allows to prepare merge requests and check the inconsistencies between Gitlab and Jira')
program.requiredOption('-p, --project <project>', 'Gitlab project')
program.requiredOption('-mr, --merge-request <merge-request>', 'Gitlab merge request id')
program.requiredOption('-t, --team <team>', 'Jira team', 'foundations')
program.action(async (options) => {
  const { mergeRequest, project, team } = options

  const deliveryHelper = new DeliveryHelper(team)
  await deliveryHelper.run(project, mergeRequest)
})

program.addHelpText('after', `

Example call:
    pnpm run deliver --help
    pnpm run deliver -p webapp -mr 7777 -t foundations
    pnpm run deliver --project webapp --merge-request 7777 --team foundations 

The execution result will be available in "${REPORT_FILE_PATH}"`)

program.exitOverride()

try {
  program.parse()
}
catch {
  // avoid error message
}

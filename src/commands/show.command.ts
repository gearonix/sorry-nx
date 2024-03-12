import chalk from 'chalk'
import { Command, CommandRunner, Option } from 'nest-commander'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'
import { addLibraryPrefix } from '@/shared/misc'

export interface ShowCommandOptions {
  json?: boolean
}

@Command({
  name: 'show',
  // TODO: add descriptions
  description: ''
})
export class ShowCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager
  ) {
    super()
  }

  // TODO: add usable parameter
  public async run(_: string[], options: ShowCommandOptions) {
    const workspaces = await this.manager.getWorkspaces()

    if (options.json) {
      console.info(workspaces)
      return
    }

    for (const workspace of workspaces) {
      console.info(
        addLibraryPrefix(
          `${chalk.cyan(workspace.name)} - ${chalk.white(workspace.location)}`
        )
      )
    }
  }

  @Option({
    flags: '-json, --json [boolean]'
  })
  public returnAsJson(val: string): boolean {
    return JSON.parse(val)
  }
}

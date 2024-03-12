import { serializeJson } from '@neodx/fs'
import chalk from 'chalk'
import {
  CliUtilityService,
  Command,
  CommandRunner,
  Option
} from 'nest-commander'
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
    @InjectPackageManager() private readonly manager: AbstractPackageManager,
    private readonly utilityService: CliUtilityService
  ) {
    super()
  }

  // TODO: add usable parameter
  public async run(_: string[], options: ShowCommandOptions) {
    const workspaces = await this.manager.getWorkspaces()

    if (options.json) {
      const serializedJson = serializeJson(workspaces)
      console.info(serializedJson)
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
    name: 'json',
    flags: '-json, --json [boolean]'
  })
  public parseJson(val: string): boolean {
    return this.utilityService.parseBoolean(val)
  }
}

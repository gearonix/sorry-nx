import { Inject } from '@nestjs/common'
import chalk from 'chalk'
import {
  CliUtilityService,
  Command,
  CommandRunner,
  Option
} from 'nest-commander'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'

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
    @Inject(LoggerService) private readonly logger: LoggerService,
    private readonly utilityService: CliUtilityService
  ) {
    super()
  }

  // TODO: add usable parameter
  public async run(_: string[], options: ShowCommandOptions) {
    const workspaces = await this.manager.getWorkspaces()

    if (options.json) {
      this.logger.serialize(workspaces)
      return
    }

    for (const workspace of workspaces) {
      this.logger.log(
        `${chalk.cyan(workspace.name)} - ${chalk.white(workspace.location)}`
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

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
import { InjectPackageManager } from '@/pkg-manager/pkg-manager.decorator'

export interface ShowCommandOptions {
  json?: boolean
}

@Command({
  name: 'show',
  description: 'Show workspace projects graph information'
})
export class ShowCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager,
    @Inject(LoggerService) private readonly logger: LoggerService,
    private readonly utilityService: CliUtilityService
  ) {
    super()
  }

  public async run(_: string[], options: ShowCommandOptions) {
    await this.manager.computeWorkspaceProjects()

    const { projects } = this.manager

    if (options.json) {
      this.logger.serialize(projects)
      return
    }

    for (const workspace of projects) {
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

import { assertDir, ensureFile } from '@neodx/fs'
import { mapValues } from '@neodx/std'
import { Inject } from '@nestjs/common'
import {
  CliUtilityService,
  Command,
  CommandRunner,
  Option
} from 'nest-commander'
import { resolve } from 'node:path'
import { ConfigService } from '@/config'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import { InjectPackageManager } from '@/pkg-manager/pkg-manager.decorator'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'
import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'
import type { PackageJson, PackageScripts } from '@/shared/json'
import { writeJson } from '@/shared/json'
import { invariant } from '@/shared/misc'

export interface MigrateCommandOptions {
  all?: boolean
}

@Command({
  name: 'migrate',
  // TODO: add descriptions
  description: ''
})
export class MigrateCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConfigService) private readonly cfg: ConfigService,
    private readonly utilityService: CliUtilityService
  ) {
    super()
  }

  public async run(params: string[], options: MigrateCommandOptions) {
    await this.manager.computeWorkspaceProjects()
    const { projects: workspaceProjects } = this.manager

    if (options.all) {
      await Promise.all(
        workspaceProjects.map(async (projectMeta) =>
          this.migrateProjectCommands(projectMeta, options)
        )
      )
      return
    }

    const [projectName = ROOT_PROJECT] = params
    const projectMeta = workspaceProjects.find(
      ({ name }) => name === projectName
    )

    invariant(projectMeta, `Project '${projectName}' not found.`)

    await this.migrateProjectCommands(projectMeta)
  }

  private async migrateProjectCommands(
    projectMeta: WorkspaceProject,
    options?: MigrateCommandOptions
  ): Promise<void> {
    const { location: projectCwd, type: targetType } = projectMeta

    await assertDir(projectMeta.location)

    if (targetType === 'package-scripts') {
      const commandsFilePath = resolve(
        projectMeta.location,
        this.cfg.commandsFile
      )
      const pkgScripts = projectMeta.targets as NonNullable<
        PackageJson['scripts']
      >

      await ensureFile(commandsFilePath)

      const serializedTargets = mapValues<PackageScripts, TargetOptions>(
        pkgScripts,
        (command) => ({ command })
      )

      await writeJson(commandsFilePath, serializedTargets)

      return this.logger.info(
        `Generated ${this.cfg.commandsFile} in ${projectCwd}`
      )
    }

    if (!options?.all) {
      this.logger.error(
        `The specified target type '${targetType}' is not allowed.
        It seems you may already have a '${this.cfg.commandsFile}' file in your project.`
      )
    }
  }

  @Option({
    flags: '--all [boolean]',
    name: 'all'
  })
  public parseAll(all: string) {
    return this.utilityService.parseBoolean(all)
  }
}

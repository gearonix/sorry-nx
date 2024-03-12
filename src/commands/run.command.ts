import { ensureFile } from '@neodx/fs'
import { hasOwn, isObject } from '@neodx/std'
import { Inject } from '@nestjs/common'
import { Command, CommandRunner, Option } from 'nest-commander'
import { dirname, resolve } from 'node:path'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'
import { invariant } from '@/shared/misc'

export interface BaseInitOptions {
  args?: string
}

@Command({
  name: 'run',
  options: {
    isDefault: true
  },
  description: ''
})
export class RunCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    super()
  }

  public async run(params: string[], options: BaseInitOptions) {
    const [target, project = null] = params
    const timeEnd = this.logger.time()
    let packageJsonPath = resolve(process.cwd(), 'package.json')

    invariant(target, 'Target is not provided.')

    if (project) {
      const workspaces = await this.manager.getWorkspaces()
      const projectMeta = workspaces.find(
        (workspace) => workspace.name === project
      )

      invariant(
        projectMeta,
        `Project ${project} not found. Please ensure it exists.`
      )

      packageJsonPath = resolve(projectMeta.location, 'package.json')
    }

    await ensureFile(packageJsonPath)

    const pkg = await readJson<PackageJson>(packageJsonPath)
    const projectName = project ?? pkg.name ?? 'root'

    invariant(
      isObject(pkg.scripts) && hasOwn(pkg.scripts, target),
      `Could not find target ${target} in project ${projectName}.`
    )

    const command = this.manager.createRunCommand({
      target,
      project,
      packageJsonPath,
      args: options.args
    })

    try {
      // https://github.com/oven-sh/bun/issues/6386
      const cwd =
        this.manager.agent === PackageManager.BUN
          ? dirname(packageJsonPath)
          : process.cwd()

      await this.manager.exec(command, { stdio: 'inherit', cwd })
    } catch (error) {
      this.logger.error(
        `Error occurred while executing a command via ${this.manager.agent} agent.`
      )
      this.logger.error(error)
      return
    }

    timeEnd(`Successfully ran target ${target} for project ${projectName}`)
  }

  @Option({
    flags: '-args, --args [string]',
    name: 'args'
  })
  public parseArgs(args: string) {
    if (!args) return

    const isValid = args.match(/^--\w+=\w+$/)

    invariant(isValid, "The 'args' parameter is invalid. ")

    return args
  }
}

import { ensureDir } from '@neodx/fs'
import { hasOwn, isEmpty, isObject } from '@neodx/std'
import { Inject } from '@nestjs/common'
import { execaCommand as $ } from 'execa'
import {
  CliUtilityService,
  Command,
  CommandRunner,
  Option
} from 'nest-commander'
import { dirname } from 'node:path'
import { buildTargetInfoPrompt } from '@/commands/run/run.prompts'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { PackageManager, ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import { InjectPackageManager } from '@/pkg-manager/pkg-manager.decorator'
import { ResolverService } from '@/resolver/resolver.service'
import { invariant } from '@/shared/misc'
import { createIndependentTargetCommand } from './utils/independent-target-command'

export interface RunCommandOptions {
  args?: string
  parallel?: boolean
  cwd?: string
  envFile?: string
}

@Command({
  name: 'run',
  options: {
    isDefault: true
  },
  description: 'Run command defined in project targets or package.json scripts.'
})
export class RunCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ResolverService) private readonly resolver: ResolverService,
    private readonly utilityService: CliUtilityService
  ) {
    super()
  }

  public async run(params: string[], options: RunCommandOptions) {
    const workspaceProjects = Array.from(this.manager.projects)

    if (isEmpty(workspaceProjects)) {
      await this.manager.computeWorkspaceProjects()
    }

    const [target, project = ROOT_PROJECT] = isEmpty(params)
      ? await buildTargetInfoPrompt(workspaceProjects)
      : params

    invariant(target, 'Please specify a target. It cannot be empty.')

    const timeEnd = this.logger.time()
    let projectCwd = options.cwd ?? process.cwd()

    if (project) {
      const projectMeta = workspaceProjects.find(({ name }) => name === project)

      invariant(
        projectMeta,
        `Project ${project} not found. Please ensure it exists.`
      )

      projectCwd = projectMeta.location
    }

    await ensureDir(projectCwd)

    const { targets, type: targetType } =
      await this.resolver.resolveProjectTargets(projectCwd)
    const hasTarget = isObject(targets) && hasOwn(targets, target)

    if (!hasTarget) {
      return this.logger.error(
        `Could not find target ${target} in project ${project}.`
      )
    }

    if (targetType === 'package-scripts') {
      const command = this.manager.createRunCommand({
        target,
        project,
        packageJsonPath: projectCwd,
        args: options.args
      })

      try {
        // https://github.com/oven-sh/bun/issues/6386
        const cwd =
          this.manager.agent === PackageManager.BUN
            ? dirname(projectCwd)
            : process.cwd()

        await this.manager.exec(command, { stdio: 'inherit', cwd })
      } catch (error) {
        this.logger.error(
          `Error occurred while executing a command via ${this.manager.agent} agent.`
        )
        this.logger.error(error)
        return
      }
    }

    if (targetType === 'targets') {
      const { command, env, cwd, args } = createIndependentTargetCommand(
        targets[target],
        { runOptions: options, projectCwd }
      )

      await $(`${command} ${args}`, { cwd, env, stdio: 'inherit', shell: true })
    }

    timeEnd(`Successfully ran target ${target} for project ${project}`)
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

  @Option({
    flags: '--cwd [string]',
    name: 'cwd'
  })
  public parseCwd(cwd: string) {
    return cwd
  }

  @Option({
    flags: '--parallel [boolean]',
    name: 'parallel'
  })
  public parseParallel(parallel: string) {
    return this.utilityService.parseBoolean(parallel)
  }

  @Option({
    flags: '--envFile [string]',
    name: 'envFile'
  })
  public parseEnvFile(envFile: string) {
    return envFile
  }
}

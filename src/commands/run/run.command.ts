import { ensureDir } from '@neodx/fs'
import { hasOwn, isEmpty, isObject } from '@neodx/std'
import { Inject } from '@nestjs/common'
import { execaCommand as $ } from 'execa'
import { Command, CommandRunner, Option } from 'nest-commander'
import { dirname } from 'node:path'
import { buildTargetInfoPrompt } from '@/commands/run/run.prompts'
import { createIndependentTargetCommand } from '@/commands/run/utils/independent-target-command'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'
import { PackageManager, ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import { ResolverService } from '@/resolver/resolver.service'
import type { AnyTarget } from '@/resolver/targets/targets-resolver.schema'
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
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ResolverService) private readonly resolver: ResolverService
  ) {
    super()
  }

  public async run(params: string[], options: BaseInitOptions) {
    if (isEmpty(this.manager.projects)) {
      await this.manager.computeWorkspaceProjects()
    }

    const [target, project = ROOT_PROJECT] = isEmpty(params)
      ? await buildTargetInfoPrompt(this.manager.projects)
      : params

    invariant(target, 'Please specify a target. It cannot be empty.')

    const timeEnd = this.logger.time()
    let projectCwd = process.cwd()

    if (project) {
      const projectMeta = this.manager.projects.find(
        ({ name }) => name === project
      )

      invariant(
        projectMeta,
        `Project ${project} not found. Please ensure it exists.`
      )

      projectCwd = projectMeta.location
    }

    await ensureDir(projectCwd)

    const { targets, type: targetType } =
      await this.resolver.resolveProjectTargets(projectCwd)

    invariant(
      isObject(targets) && hasOwn(targets, target),
      `Could not find target ${target} in project ${project}.`
    )

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
        targets[target] as AnyTarget,
        { defaultArgs: options.args, projectCwd }
      )

      await $(`${command} ${args}`, {
        cwd,
        env
      })
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
}
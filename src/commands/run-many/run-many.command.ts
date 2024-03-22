import {
  concurrent,
  concurrently,
  hasOwn,
  isEmpty,
  isTypeOfBoolean
} from '@neodx/std'
import { Inject } from '@nestjs/common'
import {
  CliUtilityService,
  Command,
  CommandRunner,
  Option
} from 'nest-commander'
import { cpus } from 'node:os'
import { RunCommand } from '@/commands/run/run.command'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager/pkg-manager.decorator'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'
import { invariant, joinCommas, serializeCommas } from '@/shared/misc'

export interface RunManyCommandOptions {
  all?: boolean
  exclude?: string[]
  parallel?: number
  projects?: string[]
  targets?: string[]
}

@Command({
  name: 'run-many',
  description:
    'Run multiple commands defined in project targets or package.json scripts.'
})
export class RunManyCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(RunCommand) private readonly runner: RunCommand,
    private readonly utilityService: CliUtilityService
  ) {
    super()
  }

  private readonly DEFAULT_CONCURRENT_THREADS = 1 as const

  public async run(_: string[], opts: RunManyCommandOptions) {
    await this.manager.computeWorkspaceProjects()

    const timeEnd = this.logger.time()
    const projects = Array.from(this.manager.projects)

    const computeProjectsToRun = (): WorkspaceProject[] => {
      if (opts.all) return projects

      const isExcluded = ({ name }: WorkspaceProject) =>
        !opts.exclude?.includes(name)
      const isIncluded = ({ name }: WorkspaceProject) =>
        opts.projects?.includes(name)

      if (opts.exclude) return projects.filter(isExcluded)
      if (opts.projects) return projects.filter(isIncluded)

      this.logger.error(
        'Invalid options provided: Either "all", "exclude", or "projects" should be specified.'
      )
      process.exit(1)
    }
    const projectsToRun = computeProjectsToRun()

    invariant(opts.targets && !isEmpty(opts.targets), 'Targets are required.')

    const targetsToRun = opts.targets as string[]
    const threadsConcurrency = isTypeOfBoolean(opts.parallel)
      ? cpus().length
      : opts.parallel ?? this.DEFAULT_CONCURRENT_THREADS

    await concurrently(
      projectsToRun,
      async (projectMeta) => {
        const targetsConcurrency = Math.min(targetsToRun.length, cpus().length)

        const splitTargets = concurrent<string, void>(async (target) => {
          if (!hasOwn(projectMeta.targets, target)) {
            projectsToRun.splice(projectsToRun.indexOf(projectMeta), 1)
            return
          }

          const project = projectMeta.name
          this.logger.log(
            `${this.logger.greaterSignPrefix} sx run ${project}:${target}\n`
          )
          this.logger.mute()
          try {
            await this.runner.run([target, project], {})
          } catch {}

          this.logger.unmute()
        }, targetsConcurrency)

        await splitTargets(targetsToRun)
      },
      threadsConcurrency
    )

    const projectNames = projectsToRun.map(({ name }) => name)

    if (!isEmpty(projectsToRun)) {
      timeEnd(
        `Successfully ran targets ${joinCommas(targetsToRun)} for projects ${joinCommas(projectNames)}`
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

  @Option({
    flags: '--parallel [boolean]',
    name: 'parallel'
  })
  public parseParallel(parallel: string) {
    return this.utilityService.parseInt(parallel)
  }

  @Option({
    flags: '-e --exclude [string]',
    name: 'exclude'
  })
  public parseExclude(exclude: string) {
    return serializeCommas(exclude)
  }

  @Option({
    flags: '-p --projects [string]',
    name: 'projects'
  })
  public parseProjects(projects: string) {
    return serializeCommas(projects)
  }

  @Option({
    flags: '-t --targets [string]',
    name: 'targets'
  })
  public parseTargets(targets: string) {
    return serializeCommas(targets)
  }
}

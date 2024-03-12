import { ensureFile } from '@neodx/fs'
import type { AnyRecord } from '@neodx/std'
import { entries, hasOwn, isEmpty, isObject, keys } from '@neodx/std'
import { Inject } from '@nestjs/common'
import inquirer from 'inquirer'
import { default as searchListPrompt } from 'inquirer-search-list'
import treePrompt from 'inquirer-tree-prompt'
import { Command, CommandRunner, Option } from 'nest-commander'
import { dirname, resolve } from 'node:path'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'
import { invariant, truncateString } from '@/shared/misc'

export interface BaseInitOptions {
  args?: string
}

// export async function doStuff(
//   projects: WorkspaceProject[]
// ): Promise<[string, string]> {}

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
    if (isEmpty(this.manager.projects)) {
      await this.manager.computeWorkspaceProjects()
    }

    let [target, project = 'root'] = params
    const timeEnd = this.logger.time()
    let packageJsonPath = resolve(process.cwd(), 'package.json')

    if (!target) {
      inquirer.registerPrompt('tree', treePrompt)
      inquirer.registerPrompt('search-list', searchListPrompt)

      const hasWorkspaces = this.manager.projects.length > 1

      if (!hasWorkspaces) {
        const rootProject = this.manager.projects.find(
          (project) => project.name === 'root'
        )

        invariant(rootProject, 'no root project')

        const { targetInfo } = await inquirer.prompt([
          {
            type: 'search-list',
            message: 'Select target:',
            name: 'targetInfo',
            choices: keys(rootProject.targets)
          }
        ])

        target = targetInfo
      } else {
        const { targetInfo } = await inquirer.prompt([
          {
            type: 'tree',
            name: 'targetInfo',
            multiple: false,
            validate: Boolean,
            message: 'Select the project target:',
            tree: this.manager.projects.flatMap<AnyRecord>((project) => {
              const children = entries(project.targets).map(
                ([targetName, script]) => ({
                  name: targetName,
                  value: {
                    project: project.name,
                    target: targetName
                  },
                  short: truncateString(script, 14)
                })
              )

              if (project.name === 'root') return children

              return {
                name: project.name,
                value: '',
                open: true,
                children
              }
            })
          }
        ])
        ;({ target, project } = targetInfo)
      }
    }

    if (project) {
      const projectMeta = this.manager.projects.find(
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

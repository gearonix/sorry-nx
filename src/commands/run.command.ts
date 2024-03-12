import { ensureFile } from '@neodx/fs'
import { hasOwn, isNil } from '@neodx/std'
import chalk from 'chalk'
import { Command, CommandRunner, Option } from 'nest-commander'
import { dirname, resolve } from 'node:path'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'
import { addLibraryPrefix } from '@/shared/misc'

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
    @InjectPackageManager() private readonly manager: AbstractPackageManager
  ) {
    super()
  }

  public async run(params: string[], options: BaseInitOptions) {
    const [target, project = null] = params

    if (!target) {
      console.log('no target')
      return
    }

    const startTime = Date.now()

    let packageJsonPath = resolve(process.cwd(), 'package.json')

    if (project) {
      const workspaces = await this.manager.getWorkspaces()

      const projectMeta = workspaces.find(
        (workspace) => workspace.name === project
      )

      if (!projectMeta) {
        // TODO improve errors rewrite to class
        throw new Error(
          `Project ${chalk.cyan(project)} not found. Please ensure it exists.`
        )
      }

      packageJsonPath = resolve(projectMeta.location, 'package.json')
    }

    await ensureFile(packageJsonPath)

    const pkg = (await readJson(packageJsonPath)) as PackageJson

    const projectName = project ?? pkg.name ?? 'root'

    if (isNil(pkg.scripts) || !hasOwn(pkg.scripts, target)) {
      // TODO improve errors
      throw new Error(
        `Could not find target ${chalk.cyan(target)} in project ${chalk.white(projectName)}.`
      )
    }

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
      console.log(error)
    }

    // TODO: improve logger
    console.info(
      addLibraryPrefix(
        `Successfully ran target ${chalk.cyan(target)} for project ${chalk.white(project ?? pkg.name)} (${Date.now() - startTime} ms)`
      )
    )
  }

  @Option({
    flags: '-args, --args [string]',
    name: 'args'
  })
  public parseArgs(args: string) {
    if (!args) return

    const isValid = args.match(/^--\w+=\w+$/)

    if (!isValid) {
      throw new Error('not valid')
    }

    return args
  }
}

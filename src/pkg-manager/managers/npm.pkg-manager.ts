import { parseJson } from '@neodx/fs'
import {
  entries,
  hasOwn,
  isObject,
  isTypeOfString,
  toArray
} from '@neodx/std'
import { resolve } from 'node:path'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type {
  RunCommandOptions,
  WorkspaceProject
} from '@/pkg-manager/pkg-manager.types'

interface NpmWorkspaceMetadata {
  name?: string
  version?: string
  dependencies: Record<
    string,
    {
      version?: string
      resolved: `file:../${string}`
      overridden: boolean
    }
  >
}

export class NpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.NPM)
  }

  public async computeWorkspaceProjects(): Promise<void> {
    const isWorkspaceMetadata = (val: unknown): val is NpmWorkspaceMetadata =>
      isObject(val) && hasOwn(val, 'dependencies')

    const cwd = process.cwd()

    const rootProject = {
      name: 'root',
      location: cwd,
      targets: await this.resolveProjectTargets(cwd)
    } satisfies WorkspaceProject

    const output = await this.exec('ls --workspaces --json').catch(() => {})

    if (!output) {
      this.projects = toArray(rootProject)
      return
    }

    const metadata = parseJson(output)

    if (!isWorkspaceMetadata(metadata)) return

    const dependencies = entries(metadata.dependencies)

    // TODO: rewrite promise.all to parallel execution
    const npmWorkspaces = await Promise.all(
      dependencies.map(async ([name, dependency]) => {
        const normalizedPath = dependency.resolved.replace(/^file:..\//, '')
        const absolutePath = resolve(cwd, normalizedPath)

        const targets = await this.resolveProjectTargets(absolutePath)

        return {
          name,
          location: absolutePath,
          targets
        }
      })
    )

    this.projects = [rootProject, ...npmWorkspaces]
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['run', opts.target, '--silent']

    if (opts.project && opts.project !== 'root') {
      command.push(`--workspace=${opts.project}`)
    }

    if (isTypeOfString(opts.args)) {
      command.push('--', opts.args)
    }

    return command
  }
}

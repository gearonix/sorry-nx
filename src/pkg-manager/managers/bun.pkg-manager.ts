import { scan } from '@neodx/fs'
import { isTypeOfString } from '@neodx/std'
import { dirname, resolve } from 'node:path'
import * as process from 'process'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type {
  RunCommandOptions,
  WorkspaceProject
} from '@/pkg-manager/pkg-manager.types'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'

// TODO: add yarn@berry support
// TODO: split file structure to modules

export class BunPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.BUN)
  }

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const packageJson = await readJson<PackageJson>('package.json')

    if (!packageJson) return []

    const rawWorkspaces = packageJson.workspaces

    const workspaces = Array.isArray(rawWorkspaces)
      ? rawWorkspaces
      : rawWorkspaces!.packages

    const projectPatterns = await scan(
      process.cwd(),
      workspaces.map((match) => resolve(match, 'package.json'))
    )

    const bunWorkspaces = await Promise.all(
      projectPatterns.map(async (pattern) => {
        const scopedPkgJson = (await readJson(pattern)) as PackageJson

        const workspaceName = scopedPkgJson.name ?? null
        const workspaceDir = dirname(pattern)

        return {
          name: workspaceName,
          location: workspaceDir
        }
      })
    )

    return bunWorkspaces
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['--silent', 'run', opts.target]
    const projectCwd = dirname(opts.packageJsonPath)

    if (opts.project) {
      // Doesn't work for some reason
      // https://github.com/oven-sh/bun/issues/6386
      command.push(`--cwd=${projectCwd}`)
    }

    if (isTypeOfString(opts.args)) {
      command.push('--', opts.args)
    }

    return command
  }
}

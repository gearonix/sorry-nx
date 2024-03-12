import { scan } from '@neodx/fs'
import { isTypeOfString } from '@neodx/std'
import { dirname, resolve } from 'node:path'
import * as process from 'process'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager, ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import type { RunCommandOptions } from '@/pkg-manager/pkg-manager.types'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'

// TODO: split file structure to modules

export class BunPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.BUN)
  }

  public async computeWorkspaceProjects(): Promise<void> {
    const packageJson = await readJson<PackageJson>('package.json')

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
        const scopedPkgJson = await readJson<PackageJson>(pattern)

        const workspaceName = scopedPkgJson.name ?? null
        const workspaceDir = dirname(pattern)
        const targets = await this.resolveProjectTargets(workspaceDir)

        return {
          name: workspaceName,
          location: workspaceDir,
          targets
        }
      })
    )

    await this.updateProjects(bunWorkspaces)
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['--silent', 'run', opts.target]

    if (isTypeOfString(opts.args)) {
      command.push('--', opts.args)
    }

    return command
  }
}

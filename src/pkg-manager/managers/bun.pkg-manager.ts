import { scan } from '@neodx/fs'
import { resolve } from 'node:path'
import * as process from 'process'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'

// TODO: add yarn@berry support
// TODO: split file structure to modules

export class BunPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.BUN)
  }

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const packageJson = await readJson('package.json')

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
        const workspaceDir = resolve(pattern, '..')

        return {
          name: workspaceName,
          location: workspaceDir
        }
      })
    )

    return bunWorkspaces
  }
}

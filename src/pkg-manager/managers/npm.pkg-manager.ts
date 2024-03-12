import { parseJson } from '@neodx/fs'
import { entries, hasOwn, isObject } from '@neodx/std'
import { resolve } from 'node:path'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

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

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const cwd = process.cwd()

    const isWorkspaceMetadata = (val: unknown): val is NpmWorkspaceMetadata =>
      isObject(val) && hasOwn(val, 'dependencies')

    const output = await this.exec('ls --workspaces --json')

    const workspaces = parseJson(output)

    if (!isWorkspaceMetadata(workspaces)) return []

    const npmWorkspaces = entries(workspaces.dependencies).map(
      ([name, dependency]) => {
        const normalizedPath = dependency.resolved.replace(/^file:..\//, '')

        return {
          name,
          location: resolve(cwd, normalizedPath)
        }
      }
    )

    return npmWorkspaces
  }
}

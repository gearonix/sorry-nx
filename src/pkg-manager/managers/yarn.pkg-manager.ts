import { parseJson } from '@neodx/fs'
import { entries, isObject } from '@neodx/std'
import { resolve } from 'node:path'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

type YarnWorkspaceMeta = Record<
  string,
  {
    location: string
    workspaceDependencies: string[]
    mismatchedWorkspaceDependencies: string[]
  }
>

export class YarnPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.YARN)
  }

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const stdout = await this.exec('workspaces info')

    const jsonStartIndex = stdout.indexOf('{')
    const jsonEndIndex = stdout.lastIndexOf('}')
    const jsonString = stdout.slice(jsonStartIndex, jsonEndIndex + 1)

    const workspaces = parseJson(jsonString) as unknown

    if (!isObject(workspaces)) return []

    const yarnWorkspaces = entries(workspaces as YarnWorkspaceMeta).map(
      ([name, metadata]) => ({
        name,
        location: resolve(process.cwd(), metadata.location)
      })
    )

    return yarnWorkspaces
  }
}

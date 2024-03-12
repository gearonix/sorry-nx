import { parseJson } from '@neodx/fs'
import { hasOwn, isObject, isTruthy } from '@neodx/std'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

export class YarnBerryPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.YARN_BERRY)
  }

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const stdout = await this.exec('workspaces list --json')
    const serializedLines = stdout.trim().split('\n')

    const workspaces = await Promise.all(
      serializedLines.map(async (serializedMeta) => {
        const isWorkspaceProject = (val: unknown): val is WorkspaceProject =>
          isObject(val) && hasOwn(val, 'location')

        const project = await parseJson(serializedMeta)

        return isWorkspaceProject(project) ? project : null
      })
    )

    return workspaces.filter(isTruthy)
  }
}

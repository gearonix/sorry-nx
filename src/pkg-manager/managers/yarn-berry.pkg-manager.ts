import { parseJson } from '@neodx/fs'
import { hasOwn, isObject, isTruthy } from '@neodx/std'
import { execaCommand as $ } from 'execa'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

export class YarnBerryPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.YARN_BERRY)
  }

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const cwd = process.cwd()

    const output = await $('yarn workspaces list --json', {
      cwd
    })

    const serializedLines = output.stdout.trim().split('\n')

    const workspaces = await Promise.all(
      serializedLines.map(async (serializedMeta) => {
        const isWorkspaceProject = (val: unknown): val is WorkspaceProject =>
          isObject(project) && hasOwn(project, 'location')

        const project = await parseJson(serializedMeta)

        if (isWorkspaceProject(project)) {
          return project
        }

        return null
      })
    )

    return workspaces.filter(isTruthy)
  }
}

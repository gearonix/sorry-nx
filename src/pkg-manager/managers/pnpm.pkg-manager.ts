import { parseJson } from '@neodx/fs'
import { hasOwn, isObjectLike } from '@neodx/std'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

type PnpmWorkspaceMeta = Array<{
  name: string
  version?: string
  path: string
  private?: boolean
}>

export class PnpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.PNPM)
  }

  public async getWorkspaces(): Promise<WorkspaceProject[]> {
    const isWorkspaceMetadata = (val: unknown): val is PnpmWorkspaceMeta =>
      isObjectLike(val) && hasOwn(val, 'length')

    const output = await this.exec('list --recursive --depth -1 --json ')

    const workspaces = parseJson(output) as unknown

    if (!isWorkspaceMetadata(workspaces)) return []

    return workspaces.map(({ name, path }) => ({
      name,
      location: path
    }))
  }
}

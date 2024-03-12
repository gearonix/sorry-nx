import { parseJson } from '@neodx/fs'
import { isTypeOfString } from '@neodx/std'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type { RunCommandOptions } from '@/pkg-manager/pkg-manager.types'

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

  public async computeWorkspaceProjects(): Promise<void> {
    const output = await this.exec('list --recursive --depth -1 --json ')
    const workspaces = parseJson<PnpmWorkspaceMeta>(output)

    if (!Array.isArray(workspaces)) return

    const pnpmWorkspaces = await Promise.all(
      workspaces.map(async ({ name, path }) => {
        const targets = await this.resolveProjectTargets(path)

        return {
          name,
          location: path,
          targets
        }
      })
    )

    this.projects = pnpmWorkspaces
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['run', '--silent', opts.target]

    if (opts.project) {
      command.splice(1, 0, `--filter=${opts.project}`)
    }

    if (isTypeOfString(opts.args)) {
      command.push('--', opts.args)
    }

    console.log(command)

    return command
  }
}

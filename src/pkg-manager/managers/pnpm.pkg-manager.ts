import { parseJson } from '@neodx/fs'
import {
  compact,
  concurrently,
  isTruthy,
  isTypeOfString
} from '@neodx/std'
import { cpus } from 'node:os'
import { pathEqual } from 'path-equal'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager, ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import type { PackageManagerFactoryOptions } from '@/pkg-manager/pkg-manager.factory'
import type { RunCommandOptions } from '@/pkg-manager/pkg-manager.types'

interface PnpmWorkspaceMeta {
  name: string
  version?: string
  path: string
  private?: boolean
}

export class PnpmPackageManager extends AbstractPackageManager {
  constructor(opts: PackageManagerFactoryOptions) {
    super(opts, PackageManager.PNPM)
  }

  public async computeWorkspaceProjects(): Promise<void> {
    const rawOutput = await this.exec('list --recursive --depth -1 --json')
    const serializedMeta = compact(rawOutput.split(']')).map((s) =>
      s.concat(']')
    )

    const pnpmWorkspaces = await concurrently(
      serializedMeta,
      async (meta) => {
        const [workspaceMeta] = parseJson<[PnpmWorkspaceMeta]>(meta)
        const { path, name } = workspaceMeta

        const isRoot = pathEqual(path, process.cwd())

        if (!isRoot) return

        const { targets, type } =
          await this.resolver.resolveProjectTargets(path)

        return { name, location: path, targets, type }
      },
      cpus().length
    )

    await this.updateProjects(pnpmWorkspaces.filter(isTruthy))
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['run', '--silent', opts.target]

    if (opts.project === ROOT_PROJECT) {
      command.push('-w')
    } else command.splice(1, 0, `--filter=${opts.project}`)

    if (isTypeOfString(opts.args)) {
      command.push('--', opts.args)
    }

    return command
  }
}

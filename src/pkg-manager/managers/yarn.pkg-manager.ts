import { parseJson } from '@neodx/fs'
import { entries, isObject, isTypeOfString } from '@neodx/std'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager, ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import type { RunCommandOptions } from '@/pkg-manager/pkg-manager.types'
import { toAbsolutePath } from '@/shared/misc'

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

  public async computeWorkspaceProjects(): Promise<void> {
    const stdout = await this.exec('workspaces info')

    const jsonStartIndex = stdout.indexOf('{')
    const jsonEndIndex = stdout.lastIndexOf('}')
    const jsonString = stdout.slice(jsonStartIndex, jsonEndIndex + 1)

    const workspaces = parseJson<YarnWorkspaceMeta>(jsonString)

    if (!isObject(workspaces)) {
      return this.updateProjects()
    }

    const workspacesEntries = entries(workspaces)
    const yarnWorkspaces = await Promise.all(
      workspacesEntries.map(async ([name, metadata]) => {
        const location = toAbsolutePath(metadata.location)
        const targets = await this.resolveProjectTargets(location)

        return {
          name,
          location,
          targets
        }
      })
    )

    await this.updateProjects(yarnWorkspaces)
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['--silent', 'run', opts.target]

    if (opts.project !== ROOT_PROJECT) {
      command.unshift('workspace', opts.project)
    }

    if (isTypeOfString(opts.args)) {
      command.push(opts.args)
    }

    return command
  }
}

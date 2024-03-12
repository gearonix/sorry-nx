import { parseJson } from '@neodx/fs'
import { isTruthy, isTypeOfString } from '@neodx/std'
import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { PackageManager } from '@/pkg-manager/pkg-manager.consts'
import type {
  RunCommandOptions,
  WorkspaceProject
} from '@/pkg-manager/pkg-manager.types'

export class YarnBerryPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.YARN_BERRY)
  }

  public async computeWorkspaceProjects(): Promise<void> {
    const stdout = await this.exec('workspaces list --json')
    const serializedLines = stdout.trim().split('\n')

    const workspaces = await Promise.all(
      serializedLines.map(async (serializedMeta) => {
        const project = parseJson<WorkspaceProject>(serializedMeta)
        const targets = await this.resolveProjectTargets(project.location)

        return {
          ...project,
          targets
        }
      })
    )

    this.projects = workspaces.filter(isTruthy)
  }

  public createRunCommand(opts: RunCommandOptions): string[] {
    const command = ['--silent', 'run', opts.target]

    if (opts.project) {
      command.unshift('workspace', opts.project)
    }

    if (isTypeOfString(opts.args)) {
      command.push(opts.args)
    }

    return command
  }
}

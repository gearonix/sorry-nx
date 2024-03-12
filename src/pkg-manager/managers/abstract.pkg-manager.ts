import { isObject, isTypeOfString } from '@neodx/std'
import type { Options as ExecaOptions } from 'execa'
import { execaCommand as $ } from 'execa'
import { resolve } from 'node:path'
import type {
  RunCommandOptions,
  WorkspaceProject
} from '@/pkg-manager/pkg-manager.types'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'

export abstract class AbstractPackageManager {
  public projects: WorkspaceProject[] = []

  constructor(private command: string) {
    this.computeWorkspaceProjects()
  }

  public async exec(args: string | string[], options?: ExecaOptions) {
    const output = await $(
      `${this.command} ${isTypeOfString(args) ? args : args.join(' ')}`,
      {
        cwd: process.cwd(),
        ...options
      }
    )

    return output.stdout as string
  }

  public async resolveProjectTargets(
    projectPath: string
  ): Promise<Record<string, string>> {
    const pkgJsonPath = resolve(projectPath, 'package.json')
    const pkg = await readJson<PackageJson>(pkgJsonPath)

    if (!isObject(pkg.scripts)) return {}

    return pkg.scripts
  }

  public get agent() {
    return this.command
  }

  public abstract computeWorkspaceProjects(): Promise<void>

  public abstract createRunCommand(opts: RunCommandOptions): string[]
}

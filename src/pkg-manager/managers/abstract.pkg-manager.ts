import { isTypeOfString } from '@neodx/std'
import type { Options as ExecaOptions } from 'execa'
import { execaCommand as $ } from 'execa'
import { ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import type { PackageManagerFactoryOptions } from '@/pkg-manager/pkg-manager.factory'
import type {
  RunCommandOptions,
  WorkspaceProject
} from '@/pkg-manager/pkg-manager.types'
import type { ResolverService } from '@/resolver/resolver.service'

export abstract class AbstractPackageManager {
  public projects: Set<WorkspaceProject> = new Set()
  protected readonly resolver: ResolverService

  constructor(
    protected options: PackageManagerFactoryOptions,
    private command: string
  ) {
    this.resolver = options.resolver

    this.computeWorkspaceProjects()
  }

  public async exec(args: string | string[], options?: ExecaOptions) {
    const output = await $(
      `${this.command} ${isTypeOfString(args) ? args : args.join(' ')}`,
      { cwd: process.cwd(), ...options }
    )

    return output.stdout as string
  }

  public get agent() {
    return this.command
  }

  protected async updateProjects(
    workspaces: WorkspaceProject[] = []
  ): Promise<void> {
    const cwd = process.cwd()
    const { targets, type } = await this.resolver.resolveProjectTargets(cwd)

    const root = {
      name: ROOT_PROJECT,
      location: cwd,
      targets,
      type
    } satisfies WorkspaceProject

    this.projects.clear()
    this.projects.add(root)
    workspaces.forEach(this.projects.add, this.projects)
  }

  public abstract computeWorkspaceProjects(): Promise<void>

  public abstract createRunCommand(opts: RunCommandOptions): string[]
}

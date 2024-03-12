import { isTypeOfString } from '@neodx/std'
import type { Options as ExecaOptions } from 'execa'
import { execaCommand as $ } from 'execa'
import type {
  RunCommandOptions,
  WorkspaceProject
} from '@/pkg-manager/pkg-manager.types'

export abstract class AbstractPackageManager {
  constructor(private command: string) {}

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

  public get agent() {
    return this.command
  }

  public abstract getWorkspaces(): Promise<WorkspaceProject[]>

  public abstract createRunCommand(opts: RunCommandOptions): string[]
}

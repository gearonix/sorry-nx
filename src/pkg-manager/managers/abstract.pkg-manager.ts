import { execaCommand as $ } from 'execa'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

export abstract class AbstractPackageManager {
  constructor(private command: string) {}

  public abstract getWorkspaces(): Promise<WorkspaceProject[]>

  public async exec(...args: string[]) {
    const output = await $(`${this.command} ${args.join(' ')}`, {
      cwd: process.cwd()
    })

    return output.stdout as string
  }

  public get agent() {
    return this.command
  }
}

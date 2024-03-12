import { execa as $ } from 'execa'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'

export abstract class AbstractPackageManager {
  constructor(private command: string) {}

  public abstract getWorkspaces(): Promise<WorkspaceProject[]>

  public async run(args: string[]) {
    const output = await $(this.command, args)

    return output.stdout
  }

  public get agent() {
    return this.command
  }
}

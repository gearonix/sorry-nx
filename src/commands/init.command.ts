import type { AnyRecord } from '@neodx/std'
import { Command, CommandRunner } from 'nest-commander'
import type { AbstractPackageManager } from '@/pkg-manager'
import { InjectPackageManager } from '@/pkg-manager'

@Command({
  name: 'init',
  options: {
    isDefault: true
  },
  description: ''
})
export class InitCommand extends CommandRunner {
  constructor(
    @InjectPackageManager() private readonly manager: AbstractPackageManager
  ) {
    super()
  }

  public async run(param: string[], options: AnyRecord) {
    console.log({
      param,
      options,
      manager: this.manager
    })

    // console.log(this.manager.agent)
    const workspaces = await this.manager.getWorkspaces()

    console.log(workspaces)
  }
}

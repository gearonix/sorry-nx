import { Command, CommandRunner, Option } from 'nest-commander'

@Command({
  name: 'init',
  options: {
    isDefault: true
  },
  description: ''
})
export class InitCommand extends CommandRunner {
  public async run(param: any, options: any) {
    console.log({
      param,
      options
    })
  }

  @Option({
    flags: '-n, --number [number]',
    description: ''
  })
  public parseNumber(val: string): number {
    return Number(val)
  }
}

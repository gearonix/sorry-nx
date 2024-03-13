import { compact } from '@neodx/std'
import envfile from 'envfile'
import type { AnyTarget } from '@/resolver/targets/targets-resolver.schema'
import { invariant, toAbsolutePath } from '@/shared/misc'

interface CreateIndependentCommandOptions {
  defaultArgs?: string
  projectCwd: string
}

enum TargetSeparators {
  NORMAL = ' && ',
  PARALLEL = ' & '
}

export function createIndependentTargetCommand(
  opts: AnyTarget,
  { defaultArgs, projectCwd }: CreateIndependentCommandOptions
) {
  const normalizeCommand = () => {
    const cmd = opts.command

    invariant(
      cmd ?? opts.commands,
      'Either "command" or "commands" must be provided.'
    )

    const result = Array.isArray(cmd) ? cmd.join(' ') : cmd

    if (!result) {
      const separator = opts.parallel
        ? TargetSeparators.PARALLEL
        : TargetSeparators.NORMAL

      return opts.commands!.join(separator)
    }

    return result
  }

  const normalizeEnv = (): Record<string, string> | undefined => {
    if (opts.envFile) return envfile.parse(toAbsolutePath(opts.envFile))
    if (env) return env
    return undefined
  }

  const command = normalizeCommand()
  const args = compact([defaultArgs, opts.args]).join(' ')
  const env = normalizeEnv()
  const cwd = toAbsolutePath(opts.cwd ?? projectCwd ?? process.cwd())

  return {
    command,
    args,
    cwd,
    env
  }
}

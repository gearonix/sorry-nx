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
  const normalizeCommand = ({
    command,
    commands,
    parallel
  }: Partial<AnyTarget>): string => {
    invariant(
      command ?? commands,
      'Either "command" or "commands" must be provided.'
    )

    const result = Array.isArray(command) ? command.join(' ') : command

    if (!result) {
      const separator = parallel
        ? TargetSeparators.PARALLEL
        : TargetSeparators.NORMAL

      return commands!.join(separator)
    }

    return result
  }

  const normalizeEnv = ({
    env,
    envFile
  }: Partial<AnyTarget>): Record<string, string> | undefined => {
    if (envFile) return envfile.parse(toAbsolutePath(envFile))
    if (env) return env
    return undefined
  }

  const command = normalizeCommand(opts)
  const args = compact([defaultArgs, opts.args]).join(' ')
  const env = normalizeEnv(opts)
  const cwd = toAbsolutePath(opts.cwd ?? projectCwd ?? process.cwd())

  return {
    command,
    args,
    cwd,
    env
  }
}

import { compact, isTypeOfString } from '@neodx/std'
import { parse as parseEnv } from 'envfile'
import { readFileSync } from 'node:fs'
import type { RunCommandOptions } from '@/commands/run/run.command'
import type {
  AnyTarget,
  TargetRecord
} from '@/resolver/targets/targets-resolver.schema'
import { invariant, toAbsolutePath } from '@/shared/misc'

interface CreateIndependentCommandOptions {
  runOptions?: RunCommandOptions
  projectCwd: string
}

enum TargetSeparators {
  NORMAL = '&&',
  PARALLEL = '&'
}

export function createIndependentTargetCommand(
  rawOptions: AnyTarget | undefined,
  { runOptions, projectCwd }: CreateIndependentCommandOptions
) {
  const opts = normalizeIndependentTargetCommandOptions(rawOptions)

  const parallel = runOptions?.parallel ?? opts.parallel
  const envFile = runOptions?.envFile ?? opts.envFile
  const projectPath = runOptions?.cwd ?? opts.cwd

  const normalizeCommand = () => {
    const cmd = opts.command

    invariant(
      cmd ?? opts.commands,
      'Either "command" or "commands" must be provided.'
    )

    const result = Array.isArray(cmd) ? cmd.join(' ') : cmd

    if (!result) {
      const separator = parallel
        ? TargetSeparators.PARALLEL
        : TargetSeparators.NORMAL

      return opts.commands!.join(` ${separator} `)
    }

    return result
  }

  const normalizeEnv = (): Record<string, string> | undefined => {
    if (envFile) {
      const envFileContents = readFileSync(toAbsolutePath(envFile), {
        encoding: 'utf-8'
      })
      return parseEnv(envFileContents)
    }

    return opts.env ?? undefined
  }

  const command = normalizeCommand()
  const args = compact([runOptions?.args, opts.args]).join(' ')
  const env = normalizeEnv()
  const cwd = toAbsolutePath(projectPath ?? projectCwd ?? process.cwd())

  return {
    command,
    args,
    cwd,
    env
  }
}

function normalizeIndependentTargetCommandOptions(
  rawOptions: AnyTarget | undefined
): TargetRecord {
  invariant(
    rawOptions,
    '[createIndependentTargetCommand] target options must be provided.'
  )

  if (isTypeOfString(rawOptions)) return { command: rawOptions }

  if (Array.isArray(rawOptions)) return { commands: rawOptions }

  return rawOptions
}

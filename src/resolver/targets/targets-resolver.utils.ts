import { isTypeOfString } from '@neodx/std'
import type { AnyTarget } from '@/resolver/targets/targets-resolver.schema'

export function formatTargetCommand<Target extends AnyTarget | string>(
  target: Target
): string {
  if (isTypeOfString(target)) return target

  const { command, commands } = target

  return command
    ? (isTypeOfString(command)
      ? command
      : command.join(' '))
    : commands!.join(' ')
}

import chalk from 'chalk'
import { ERROR_PREFIX } from '@/logger'

export function invariant<T extends unknown>(
  condition: T,
  message: string
): asserts condition is NonNullable<T> {
  if (!condition) {
    console.error(`\n ${ERROR_PREFIX} ${chalk.bold(chalk.red(message))}`)

    process.exit(1)
  }
}

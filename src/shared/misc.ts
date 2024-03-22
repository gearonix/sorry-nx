import { compact } from '@neodx/std'
import chalk from 'chalk'
import { resolve } from 'node:path'
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

export const toAbsolutePath = (localPath: string) =>
  resolve(process.cwd(), localPath)

export const truncateString = (str: string, maxLength = 14) =>
  str.length > maxLength ? str.slice(0, maxLength - 3).concat('...') : str

export const joinCommas = (arr: string[]) => arr.join(', ')
export const serializeCommas = (str: string) => compact(str.split(', '))

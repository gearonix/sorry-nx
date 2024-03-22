import { parseJson, serializeJson } from '@neodx/fs'
import type { AnyRecord } from '@neodx/std'
import chalk from 'chalk'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'process'
import { ERROR_PREFIX } from '@/logger'
import { toAbsolutePath } from '@/shared/misc'

export interface PackageJson {
  name?: string
  version: string
  type?: 'module' | 'commonjs'
  dependencies?: Record<string, string>
  packageManager?: string
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  workspaces?: string[] | (Record<string, string[]> & { packages: string[] })
}

export type PackageScripts = NonNullable<PackageJson['scripts']>

export async function readJson<Result extends AnyRecord = AnyRecord>(
  path: string,
  error = 'Unable to parse JSON string.'
): Promise<Result> {
  try {
    const jsonFile = await readFile(resolve(process.cwd(), path), 'utf-8')

    return parseJson(jsonFile)
  } catch {
    console.error(`\n ${ERROR_PREFIX}  ${chalk.bold(chalk.red(error))}\n`)

    process.exit(1)
  }
}

export async function writeJson<Result extends AnyRecord = AnyRecord>(
  path: string,
  content: Result,
  error = 'Unable to write JSON.'
) {
  try {
    await writeFile(toAbsolutePath(path), serializeJson(content))
  } catch {
    console.error(`\n ${ERROR_PREFIX}  ${chalk.bold(chalk.red(error))}\n`)

    process.exit(1)
  }
}

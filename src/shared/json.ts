import { parseJson } from '@neodx/fs'
import type { AnyRecord } from '@neodx/std'
import chalk from 'chalk'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'process'
import { ERROR_PREFIX } from '@/logger'

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

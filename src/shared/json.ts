import { parseJson } from '@neodx/fs'
import type { AnyRecord } from '@neodx/std'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'process'

export interface PackageJson {
  name?: string
  version: string
  type?: 'module' | 'commonjs'
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  workspaces?: string[] | (Record<string, string[]> & { packages: string[] })
}

export async function readJson(path: string): Promise<AnyRecord | null>

export async function readJson(
  path: 'package.json'
): Promise<PackageJson | null>

export async function readJson(path: string): Promise<AnyRecord | null> {
  try {
    const jsonFile = await readFile(resolve(process.cwd(), path), 'utf-8')

    return parseJson(jsonFile)
  } catch {
    return null
  }
}

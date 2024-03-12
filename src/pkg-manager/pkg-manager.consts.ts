import { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { BunPackageManager } from '@/pkg-manager/managers/bun.pkg-manager'
import { NpmPackageManager } from '@/pkg-manager/managers/npm.pkg-manager'
import { PnpmPackageManager } from '@/pkg-manager/managers/pnpm.pkg-manager'
import { YarnPackageManager } from '@/pkg-manager/managers/yarn.pkg-manager'

export const PACKAGE_MANAGER = 'PACKAGE_MANAGER' as const

export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
  BUN = 'bun',
  YARN_BERRY = 'yarn@berry'
}

interface PackageManagerMatcher {
  lockFile: string
  name: PackageManager
  manager: new () => AbstractPackageManager
}

export const packageManagerMatchers = [
  {
    lockFile: 'package-lock.json',
    name: PackageManager.NPM,
    manager: NpmPackageManager
  },
  {
    lockFile: 'yarn.lock',
    name: PackageManager.YARN,
    manager: YarnPackageManager
  },
  {
    lockFile: 'pnpm-lock.yaml',
    name: PackageManager.PNPM,
    manager: PnpmPackageManager
  },
  {
    lockFile: 'bun.lockb',
    name: PackageManager.BUN,
    manager: BunPackageManager
  }
] satisfies PackageManagerMatcher[]

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
  BUN = 'bun'
}

interface PackageManagerMatcher {
  lockFile: string
  manager: new () => AbstractPackageManager
}

export const lockFileMatchers = [
  {
    lockFile: 'package-lock.json',
    manager: NpmPackageManager
  },
  {
    lockFile: 'yarn.lock',
    manager: YarnPackageManager
  },
  {
    lockFile: 'pnpm-lock.yaml',
    manager: PnpmPackageManager
  },
  {
    lockFile: 'bun.lockb',
    manager: BunPackageManager
  }
] satisfies PackageManagerMatcher[]

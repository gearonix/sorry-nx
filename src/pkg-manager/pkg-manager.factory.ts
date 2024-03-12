import { readdir } from '@neodx/fs'
import type { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { lockFileMatchers } from '@/pkg-manager/pkg-manager.consts'

export class PackageManagerFactory {
  // TODO: extend
  public static async detect(): Promise<AbstractPackageManager> {
    const files = await readdir(process.cwd())

    const match = lockFileMatchers.find((matcher) =>
      files.includes(matcher.lockFile)
    )

    if (match) {
      return new match.manager()
    }

    // TODO better errors
    throw new Error('never')
  }
}

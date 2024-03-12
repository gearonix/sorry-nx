import { cmdExists } from '@antfu/ni'
import { ensureFile, scan } from '@neodx/fs'
import { isTypeOfString, uniq, values } from '@neodx/std'
import chalk from 'chalk'
import { execaCommand as $ } from 'execa'
import { basename, resolve } from 'node:path'
import type { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { YarnBerryPackageManager } from '@/pkg-manager/managers/yarn-berry.pkg-manager'
import {
  PackageManager,
  packageManagerMatchers
} from '@/pkg-manager/pkg-manager.consts'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'
import { addLibraryPrefix } from '@/shared/misc'

export class PackageManagerFactory {
  public static async detect(): Promise<AbstractPackageManager> {
    let programmaticAgent: PackageManager

    const agents = values(PackageManager)

    const lockFilePatterns = await scan(
      process.cwd(),
      uniq(packageManagerMatchers.map(({ lockFile }) => lockFile))
    )

    const lockPath = lockFilePatterns.shift() as string

    const packageJsonPath = lockPath
      ? resolve(lockPath, '../package.json')
      : resolve(process.cwd(), 'package.json')

    await ensureFile(packageJsonPath)

    const pkg = (await readJson(packageJsonPath)) as PackageJson

    if (isTypeOfString(pkg.packageManager)) {
      const [name, version] = pkg.packageManager.replace(/^\^/, '').split('@')
      const agent = name as PackageManager

      const isYarnBerry =
        agent === PackageManager.YARN &&
        version &&
        Number.parseInt(version, 10) > 1

      if (isYarnBerry) {
        return new YarnBerryPackageManager()
      }

      if (agents.includes(agent)) {
        programmaticAgent = agent
      }
    }

    const match = packageManagerMatchers.find(
      (matcher) =>
        matcher.lockFile === basename(lockPath) ||
        programmaticAgent === matcher.name
    )

    if (!match) {
      throw new Error('Unable to detect a package manager.')
    }

    if (!cmdExists(match.name)) {
      console.warn(addLibraryPrefix(`${match.name} is not installed.`))
      console.info(
        addLibraryPrefix(
          `Attempting to install ${chalk.cyan(match.name)} globally...`
        )
      )

      await $(`npm i -g ${match.name}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      })
    }

    return new match.manager()
  }
}

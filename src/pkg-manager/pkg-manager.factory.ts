import { ensureFile, scan } from '@neodx/fs'
import { includesIn, isTypeOfString, uniq, values } from '@neodx/std'
import chalk from 'chalk'
import { execaCommand as $ } from 'execa'
import { basename, resolve } from 'node:path'
import { LoggerService } from '@/logger'
import type { AbstractPackageManager } from '@/pkg-manager/managers/abstract.pkg-manager'
import { YarnBerryPackageManager } from '@/pkg-manager/managers/yarn-berry.pkg-manager'
import {
  PackageManager,
  packageManagerMatchers
} from '@/pkg-manager/pkg-manager.consts'
import type { ResolverService } from '@/resolver/resolver.service'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'
import { invariant } from '@/shared/misc'
import { cmdExists } from '@/shared/sh'

export interface PackageManagerFactoryOptions {
  resolver: ResolverService
}

export class PackageManagerFactory {
  private static logger = new LoggerService()

  public static async detect(
    opts: PackageManagerFactoryOptions
  ): Promise<AbstractPackageManager> {
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

    const pkg = await readJson<PackageJson>(packageJsonPath)

    if (isTypeOfString(pkg.packageManager)) {
      const [name, version] = pkg.packageManager.replace(/^\^/, '').split('@')
      const agent = name as PackageManager

      const isYarnBerry =
        agent === PackageManager.YARN &&
        version &&
        Number.parseInt(version, 10) > 1

      if (isYarnBerry) {
        return new YarnBerryPackageManager(opts)
      }

      const includesAgent = includesIn(agents)

      if (includesAgent(agent)) {
        programmaticAgent = agent
      }
    }

    const match = packageManagerMatchers.find(
      (matcher) =>
        matcher.lockFile === basename(lockPath) ||
        programmaticAgent === matcher.name
    )

    invariant(match, 'Unable to detect a package manager.')

    if (!cmdExists(match.name)) {
      this.logger.warn(`${match.name} is not installed.`)
      this.logger.info(
        `Attempting to install ${chalk.cyan(match.name)} globally...`
      )

      await $(`npm i -g ${match.name}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      })
    }

    return new match.manager(opts)
  }
}

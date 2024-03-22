import { assertFile } from '@neodx/fs'
import type { AnyRecord } from '@neodx/std'
import { Injectable } from '@nestjs/common'
import { resolve } from 'node:path'
import type { PackageJson } from '@/shared/json'
import { readJson } from '@/shared/json'

@Injectable()
export class PackageJsonResolverService {
  public async resolvePackageJsonScripts(
    projectCwd: string
  ): Promise<NonNullable<PackageJson['scripts']>> {
    const packageJsonPath = resolve(projectCwd, 'package.json')

    await assertFile(packageJsonPath)

    const pkg = await readJson<AnyRecord>(packageJsonPath)

    return pkg.scripts ?? {}
  }
}

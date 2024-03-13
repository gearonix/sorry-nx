import { isNull } from '@neodx/std'
import { Injectable } from '@nestjs/common'
import type { PackageJsonResolverService } from '@/resolver/package/package.resolver.service'
import type { ResolvedTargets } from '@/resolver/resolver.types'
import type { TargetsResolverService } from '@/resolver/targets/targets-resolver.service'

@Injectable()
export class ResolverService {
  constructor(
    private readonly targetsResolver: TargetsResolverService,
    private readonly pkgResolver: PackageJsonResolverService
  ) {}

  public async resolveProjectTargets(cwd: string): Promise<ResolvedTargets> {
    const targets = await this.targetsResolver.resolveProjectTargets(cwd)

    if (isNull(targets)) {
      return {
        type: 'package-scripts',
        targets: await this.pkgResolver.resolvePackageJsonScripts(cwd)
      }
    }

    return {
      type: 'targets',
      targets
    }
  }
}

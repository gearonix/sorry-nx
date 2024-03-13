import { entries, sortObjectByOrder } from '@neodx/std'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@/config'
import { LoggerService } from '@/logger'
import type { PackageJsonResolverService } from '@/resolver/package/package.resolver.service'
import type { ResolvedTargets, TargetType } from '@/resolver/resolver.types'
import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'
import type { TargetsResolverService } from '@/resolver/targets/targets-resolver.service'

@Injectable()
export class ResolverService {
  constructor(
    private readonly targetsResolver: TargetsResolverService,
    private readonly pkgResolver: PackageJsonResolverService,
    @Inject(ConfigService) private readonly cfg: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  public async resolveProjectTargets(cwd: string): Promise<ResolvedTargets> {
    const sortedResolvers = sortObjectByOrder(
      this.resolverMethods,
      this.cfg.preferredResolvingOrder
    )

    for (const [type, resolveTargets] of entries(sortedResolvers)) {
      const targets = await resolveTargets.call(this, cwd)

      if (targets) {
        return { type, targets }
      }
    }

    this.logger.error(
      `Error occurred while resolving project targets.
      Please check if preferredResolvingOrder is set correctly`
    )
    process.exit(1)
  }

  private get resolverMethods(): Record<
    TargetType,
    (cwd: string) => Promise<TargetOptions | null>
  > {
    return {
      'package-scripts': this.pkgResolver.resolvePackageJsonScripts,
      // eslint-disable-next-line prettier/prettier
      'targets': this.targetsResolver.resolveProjectTargets
    }
  }
}

import { entries, filterObject, sortObjectByOrder } from '@neodx/std'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@/config'
import { LoggerService } from '@/logger'
import { PackageJsonResolverService } from '@/resolver/package/package-resolver.service'
import type { ResolvedTargets, TargetType } from '@/resolver/resolver.types'
import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'
import { TargetsResolverService } from '@/resolver/targets/targets-resolver.service'

@Injectable()
export class ResolverService {
  constructor(
    @Inject(TargetsResolverService)
    private readonly targetsResolver: TargetsResolverService,
    @Inject(PackageJsonResolverService)
    private readonly pkgResolver: PackageJsonResolverService,
    @Inject(ConfigService) private readonly cfg: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  public async resolveProjectTargets(cwd: string): Promise<ResolvedTargets> {
    const sortedResolvers = sortObjectByOrder(
      this.resolverMethods,
      this.cfg.preferredResolvingOrder
    )

    const normalizedResolvers = filterObject(sortedResolvers, (_, key) =>
      this.cfg.preferredResolvingOrder.includes(key)
    )

    // Iterate through resolvers and resolve targets
    for (const [type, resolveTargets] of entries(normalizedResolvers)) {
      const targets = await resolveTargets(cwd)

      if (targets) {
        return { type, targets }
      }
    }

    this.logger.error(
      `Error occurred while resolving project targets.
      Please check if preferredResolvingOrder is set correctly.
      (${cwd})`
    )
    process.exit(1)
  }

  private get resolverMethods(): Record<
    TargetType,
    (cwd: string) => Promise<TargetOptions | null>
  > {
    return {
      'package-scripts': async (cwd) =>
        this.pkgResolver.resolvePackageJsonScripts(cwd),
      // eslint-disable-next-line prettier/prettier
      'targets': async (cwd)  =>
          this.targetsResolver.resolveProjectTargets(cwd)
    }
  }
}

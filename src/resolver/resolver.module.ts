import { Global, Module } from '@nestjs/common'
import { PackageJsonResolverService } from '@/resolver/package/package-resolver.service'
import { ResolverService } from '@/resolver/resolver.service'
import { TargetsResolverService } from '@/resolver/targets/targets-resolver.service'

@Global()
@Module({
  providers: [
    ResolverService,
    TargetsResolverService,
    PackageJsonResolverService
  ],
  exports: [ResolverService]
})
export class ResolverModule {}

import { Module } from '@nestjs/common'
import { PackageJsonResolverService } from '@/resolver/package/package.resolver.service'
import { ResolverService } from '@/resolver/resolver.service'
import { TargetsSchema } from '@/resolver/targets/targets-resolver.schema'
import { TargetsResolverService } from '@/resolver/targets/targets-resolver.service'

@Module({
  providers: [
    ResolverService,
    TargetsResolverService,
    PackageJsonResolverService
  ],
  exports: [
    ResolverService,
    {
      provide: 'TARGET_JSON_SCHEMA',
      useValue: TargetsSchema
    }
  ]
})
export class ResolverModule {}

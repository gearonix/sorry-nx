import { Module } from '@nestjs/common'
import { PackageManagerFactory } from '@/pkg-manager/pkg-manager.factory'
import { ResolverService } from '@/resolver/resolver.service'
import { PACKAGE_MANAGER } from './pkg-manager.consts'

@Module({
  providers: [
    {
      provide: PACKAGE_MANAGER,
      useFactory: (resolver: ResolverService) =>
        PackageManagerFactory.detect({
          resolver
        }),
      inject: [ResolverService]
    }
  ],
  exports: [PACKAGE_MANAGER]
})
export class PackageManagerModule {}

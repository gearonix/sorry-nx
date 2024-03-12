import { Module } from '@nestjs/common'
import { PackageManagerFactory } from '@/pkg-manager/pkg-manager.factory'
import { PACKAGE_MANAGER } from './pkg-manager.consts'

@Module({
  providers: [
    {
      provide: PACKAGE_MANAGER,
      useFactory: () => PackageManagerFactory.detect()
    }
  ],
  exports: [PACKAGE_MANAGER]
})
export class PackageManagerModule {}

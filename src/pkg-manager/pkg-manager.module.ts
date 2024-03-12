import { Module } from '@nestjs/common'
import { PACKAGE_MANAGER } from './pkg-manager.consts'

@Module({
  exports: [PACKAGE_MANAGER]
})
export class PackageManagerModule {}

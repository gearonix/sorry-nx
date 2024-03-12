import { Module } from '@nestjs/common'
import { Commands } from '@/commands'
import { LoggerModule } from '@/logger'
import { PackageManagerModule } from '@/pkg-manager'

@Module({
  imports: [PackageManagerModule, LoggerModule],
  providers: [...Commands]
})
export class AppModule {}

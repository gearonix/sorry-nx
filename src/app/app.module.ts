import { Module } from '@nestjs/common'
import { Commands } from '@/commands'
import { ConfigModule } from '@/config'
import { LoggerModule } from '@/logger'
import { PackageManagerModule } from '@/pkg-manager'

@Module({
  imports: [PackageManagerModule, LoggerModule, ConfigModule],
  providers: [...Commands]
})
export class AppModule {}

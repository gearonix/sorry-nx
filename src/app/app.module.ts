import { Module } from '@nestjs/common'
import { Commands } from '@/commands'
import { ConfigModule } from '@/config'
import { LoggerModule } from '@/logger'
import { PackageManagerModule } from '@/pkg-manager'
import { ResolverModule } from '@/resolver'

@Module({
  imports: [PackageManagerModule, LoggerModule, ConfigModule, ResolverModule],
  providers: [...Commands]
})
export class AppModule {}

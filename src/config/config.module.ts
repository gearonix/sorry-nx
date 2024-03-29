import { Global, Module } from '@nestjs/common'
import { ConfigService } from './config.service'

@Global()
@Module({
  controllers: [],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class ConfigModule {}

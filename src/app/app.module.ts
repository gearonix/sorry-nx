import { Module } from '@nestjs/common'
import { InitCommand } from '@/commands/init.command'

@Module({
  imports: [],
  providers: [InitCommand]
})
export class AppModule {}

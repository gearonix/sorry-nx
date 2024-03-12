import { Module } from '@nestjs/common'
import { InitCommand } from '@/commands/init.command'
import { PackageManagerModule } from '@/pkg-manager'

@Module({
  imports: [PackageManagerModule],
  providers: [InitCommand]
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { InitCommand } from '@/commands/init.command'
import { ShowCommand } from '@/commands/show.command'
import { PackageManagerModule } from '@/pkg-manager'

@Module({
  imports: [PackageManagerModule],
  providers: [InitCommand, ShowCommand]
})
export class AppModule {}

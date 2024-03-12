import { Module } from '@nestjs/common'
import { RunCommand } from '@/commands/run.command'
import { ShowCommand } from '@/commands/show.command'
import { PackageManagerModule } from '@/pkg-manager'

@Module({
  imports: [PackageManagerModule],
  providers: [RunCommand, ShowCommand]
})
export class AppModule {}

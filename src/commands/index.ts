import { MigrateCommand } from '@/commands/migrate/migrate.command'
import { RunCommand } from '@/commands/run/run.command'
import { RunManyCommand } from '@/commands/run-many/run-many.command'
import { ShowCommand } from '@/commands/show/show.command'

export const Commands = [
  RunCommand,
  MigrateCommand,
  ShowCommand,
  RunManyCommand
]

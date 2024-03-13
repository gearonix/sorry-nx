import { z } from 'zod'

export const CommandSchema = z.string()

export const TargetSchema = z.object({
  command: CommandSchema.or(z.array(CommandSchema)).optional(),
  description: z.string().optional(),
  commands: z.array(CommandSchema).optional(),
  args: z.string().optional().optional(),
  cwd: z.string().optional(),
  parallel: z.string().optional(),
  env: z.record(z.string()).optional(),
  envFile: z.string().optional(),
  readyWhen: z.string().optional()
})

export const TargetsSchema = z.record(z.string().or(TargetSchema))

export type TargetOptions = z.infer<typeof TargetsSchema>
export type AnyTarget = z.infer<typeof TargetSchema>

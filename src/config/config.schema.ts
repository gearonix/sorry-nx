import { z } from 'zod'

export const ConfigSchema = z.object({
  commandsFile: z.string().default('targets.json'),
  preferredResolvingOrder: z
    .array(z.union([z.literal('package-scripts'), z.literal('targets')]))
    .default(['targets', 'package-scripts'])
})

function createConfigValues() {
  return class ConfigValues {} as {
    new (): z.infer<typeof ConfigSchema>
  }
}

export class ConfigValues extends createConfigValues() {}

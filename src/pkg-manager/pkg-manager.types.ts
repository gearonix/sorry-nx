import type { TargetType } from '@/resolver/resolver.types'
import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'

export interface WorkspaceProject {
  name: string
  location: string
  targets: TargetOptions
  type: TargetType
}

export interface RunCommandOptions {
  target: string
  args?: string
  packageJsonPath: string
  project: string
}

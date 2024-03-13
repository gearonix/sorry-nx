import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'

export interface WorkspaceProject {
  name: string | null
  location: string
  targets: TargetOptions
}

export interface RunCommandOptions {
  target: string
  args?: string
  packageJsonPath: string
  project: string
}

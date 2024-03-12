export interface WorkspaceProject {
  name: string | null
  location: string
  targets: Record<string, string>
}

export interface RunCommandOptions {
  target: string
  args?: string
  packageJsonPath: string
  project: string
}

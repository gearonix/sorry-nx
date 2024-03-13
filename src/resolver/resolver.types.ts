import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'

export interface ResolvedTargets {
  type: 'package-scripts' | 'targets'
  targets: TargetOptions
}

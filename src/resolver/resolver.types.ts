import type { ConfigValues } from '@/config/config.schema'
import type { TargetOptions } from '@/resolver/targets/targets-resolver.schema'
import type { InferArrayItem } from '@/shared/types'

export type TargetType = InferArrayItem<ConfigValues['preferredResolvingOrder']>

export interface ResolvedTargets {
  type: TargetType
  targets: TargetOptions
}

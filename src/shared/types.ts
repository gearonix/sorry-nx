export type InferArrayItem<T extends unknown[]> = T extends (infer S)[]
  ? S
  : never

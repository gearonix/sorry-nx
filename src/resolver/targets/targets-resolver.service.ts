import { assertFile, exists } from '@neodx/fs'
import type { AnyRecord } from '@neodx/std'
import { Inject, Injectable } from '@nestjs/common'
import { resolve } from 'node:path'
import { z } from 'zod'
import { LoggerService } from '@/logger'
import { readJson } from '@/shared/json'
import type { TargetOptions } from './targets-resolver.schema'
import { TargetsSchema } from './targets-resolver.schema'

@Injectable()
export class TargetsResolverService {
  constructor(
    @Inject(LoggerService) private readonly loggerService: LoggerService
  ) {}

  public async resolveProjectTargets(
    projectCwd: string
  ): Promise<TargetOptions | null> {
    const targetJsonPath = resolve(projectCwd, 'commands.json')

    if (!exists(targetJsonPath)) return null

    await assertFile(targetJsonPath)

    const targetsJSON = await readJson<AnyRecord>(targetJsonPath)
    const targets = this.validateTargetsSchema(targetsJSON, projectCwd)

    return targets.values
  }

  public validateTargetsSchema(rawCommands: unknown, projectPath: string) {
    try {
      return { values: TargetsSchema.parse(rawCommands) }
    } catch (error_) {
      const isZodError = error_ instanceof z.ZodError

      if (!isZodError) {
        this.loggerService.error('Unknown error parsing commands.json')
        throw error_
      }

      this.loggerService.error(
        `Invalid commands.json file. (${projectPath}) See below for detailed info. \n`
      )
      this.loggerService.error(error_.format())

      process.exit(1)
    }
  }
}

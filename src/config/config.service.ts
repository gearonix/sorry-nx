import { Inject, Injectable } from '@nestjs/common'
import ini from 'ini'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { ConfigSchema, ConfigValues } from '@/config/config.schema'
import { LoggerService } from '@/logger'

@Injectable()
export class ConfigService extends ConfigValues {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    super()
    Object.assign(this, this.config)
  }

  private get config() {
    const userConfig = existsSync(this.configPath)
      ? ini.parse(readFileSync(this.configPath).toString())
      : {}

    try {
      return ConfigSchema.parse(userConfig)
    } catch (error) {
      this.logger.error(
        'Invalid .sxrc configuration. See below for detailed info.  \n'
      )
      this.logger.error(error)
      process.exit(1)
    }
  }

  private get configPath() {
    const customRcPath = process.env.SX_CONFIG_PATH

    const isWindows = process.platform === 'win32'
    const home = isWindows ? process.env.USERPROFILE : process.env.HOME

    const defaultRcPath = resolve(home ?? '~/', '.sxrc')
    const projectRcPath = resolve(process.cwd(), '.sxrc')

    const baseRcPath = customRcPath ?? defaultRcPath

    return existsSync(projectRcPath) ? projectRcPath : baseRcPath
  }
}

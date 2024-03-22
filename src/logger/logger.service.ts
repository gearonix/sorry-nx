import { serializeJson } from '@neodx/fs'
import { isTypeOfString } from '@neodx/std'
import { Injectable } from '@nestjs/common'
import chalk from 'chalk'
import {
  ERROR_PREFIX,
  GREATER_SIGN_PREFIX,
  LIBRARY_PREFIX
} from '@/logger/logger.consts'

@Injectable()
export class LoggerService {
  private isSilent: boolean

  constructor() {
    this.isSilent = false
  }

  public warn(msg: string) {
    if (this.isSilent) return

    console.warn(chalk.bold(chalk.yellow(msg)))
  }

  public error(msg: unknown) {
    if (this.isSilent) return

    if (isTypeOfString(msg)) {
      console.error(`\n ${this.errorPrefix} ${chalk.bold(chalk.red(msg))}`)
    } else if (msg instanceof Error && msg.stack) {
      console.error(chalk.bold(chalk.red(msg.stack)))
    } else {
      console.error(chalk.bold(chalk.red(msg)))
    }
  }

  public info(msg: unknown) {
    if (this.isSilent) return

    if (isTypeOfString(msg)) {
      console.info(`\n${this.libraryPrefix} ${chalk.bold(msg)}`)
    } else console.info(msg)
  }

  public time(method = this.info) {
    const startTime = Date.now()

    return (msg: string) => {
      method.call(this, `${msg} (${Date.now() - startTime} ms)`)
    }
  }

  public serialize(msg: unknown, method = this.log) {
    method.call(this, serializeJson(msg))
  }

  public log(msg: string) {
    if (!this.isSilent) {
      console.log(msg)
    }
  }

  public debug(msg: string) {
    if (!this.isSilent) {
      console.debug(msg)
    }
  }

  public fatal(msg: string) {
    if (!this.isSilent) {
      console.error(msg)
    }
  }

  public mute() {
    this.isSilent = true

    return () => {
      this.isSilent = false
    }
  }

  public unmute() {
    this.isSilent = false
  }

  public get errorPrefix() {
    return ERROR_PREFIX
  }

  public get libraryPrefix() {
    return LIBRARY_PREFIX
  }

  public get greaterSignPrefix() {
    return GREATER_SIGN_PREFIX
  }
}

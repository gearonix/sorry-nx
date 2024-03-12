import { serializeJson } from '@neodx/fs'
import { isTypeOfString } from '@neodx/std'
import { Injectable } from '@nestjs/common'
import chalk from 'chalk'
import { ERROR_PREFIX, LIBRARY_PREFIX } from '@/logger/logger.consts'

@Injectable()
export class LoggerService {
  public get errorPrefix() {
    return ERROR_PREFIX
  }

  public get libraryPrefix() {
    return LIBRARY_PREFIX
  }

  public warn(msg: string) {
    console.warn(chalk.bold(chalk.yellow(msg)))
  }

  public error(msg: unknown) {
    if (isTypeOfString(msg)) {
      console.error(`\n ${this.errorPrefix} ${chalk.bold(chalk.red(msg))}`)
    } else if (msg instanceof Error && msg.stack) {
      console.error(chalk.bold(chalk.red(msg.stack)))
    } else {
      console.error(chalk.bold(chalk.red(msg)))
    }
  }

  public info(msg: unknown) {
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

  public serialize(msg: unknown, method = this.info) {
    method(serializeJson(msg))
  }

  public log(msg: string) {
    console.log(msg)
  }

  public debug(msg: string) {
    console.debug(msg)
  }

  public fatal(msg: string) {
    console.error(msg)
  }
}

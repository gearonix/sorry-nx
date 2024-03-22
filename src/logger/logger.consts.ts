import chalk from 'chalk'

export const ERROR_PREFIX = chalk.inverse(chalk.bold(chalk.red(' ERROR ')))
export const GREATER_SIGN_PREFIX = `${chalk.cyan('>')}`
export const LIBRARY_PREFIX = `${GREATER_SIGN_PREFIX} ${chalk.inverse(chalk.bold(chalk.cyanBright(' sx ')))}`

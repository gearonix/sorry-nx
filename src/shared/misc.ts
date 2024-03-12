import chalk from 'chalk'

export const addLibraryPrefix = (message: string) =>
  `[${chalk.green('gx')}]: ${message}`

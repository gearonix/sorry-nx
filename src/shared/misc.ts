import chalk from 'chalk'

export const addLibraryPrefix = (message: string) =>
  `${chalk.dim('[gx]')}: ${message}`

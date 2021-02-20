import type { LoggerOptions } from './types'

import pino, { Logger } from 'pino'

const defaultLoggerOptions: LoggerOptions = {
  name: 'mrapi',
  level: 'info',
  // prettyPrint: {
  //   colorize: true,
  //   translateTime: 'SYS:standard',
  //   ignore: 'hostname,pid',
  // },
}

function createLogger(options: LoggerOptions): Logger {
  return pino(options)
}

function getLogger(
  logger: null | undefined | Logger,
  opts?: LoggerOptions,
): Logger {
  return (
    logger ??
    createLogger({
      ...defaultLoggerOptions,
      ...opts,
    })
  )
}

const logger = createLogger(defaultLoggerOptions)

export { Logger, LoggerOptions, logger, getLogger }

import pino, { Logger, LoggerOptions } from 'pino'

import { defaultLoggerOptions } from './config'

function createLogger(options: LoggerOptions): Logger {
  return pino(options)
}

function getLogger(logger: null | Logger, opts?: LoggerOptions): Logger {
  return (
    logger ||
    createLogger({
      ...defaultLoggerOptions,
      ...opts,
    })
  )
}

const logger = createLogger(defaultLoggerOptions)

export { Logger, LoggerOptions, logger, getLogger }

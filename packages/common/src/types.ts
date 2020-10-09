import type mrapi from '@mrapi/types'
import type {
  Logger as PinoLogger,
  LoggerOptions as PinoLoggerOptions,
} from 'pino'

declare module '@mrapi/types' {
  type Logger = PinoLogger

  interface LoggerOptions extends PinoLoggerOptions {}
}

export { mrapi }

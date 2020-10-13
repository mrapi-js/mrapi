import type { mrapi } from '@mrapi/common'

declare module '@mrapi/types' {
  namespace db {
    interface Options {
      logger?: mrapi.LoggerOptions
    }
  }
}

export { mrapi }

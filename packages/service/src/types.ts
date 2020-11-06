import type mrapi from '@mrapi/types'
import type { Options } from '@mrapi/app'

declare module '@mrapi/types' {
  interface Config {
    app?: Options
  }

  interface Endpoint {
    type: string
    path: string
  }

  interface ServiceConfig extends mrapi.Config {
    logEndpoints: boolean
  }
}

export { mrapi }

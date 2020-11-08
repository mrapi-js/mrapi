import type mrapi from '@mrapi/types'
import type { Options } from '@mrapi/app'

declare module '@mrapi/types' {
  interface Config {
    app?: Options
  }

  interface Endpoint {
    name?: string
    type: string
    path: string
  }

  interface ServiceConfig extends mrapi.Config {
    logEndpoints: boolean
    graphql?: {
      stitching?: boolean | string[]
    }
  }
}

export { mrapi }

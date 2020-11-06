import type mrapi from '@mrapi/types'
import type { HTTPMethod } from '@mrapi/router'
import type { Options } from '@mrapi/app'

declare module '@mrapi/types' {
  interface GatewayServiceConfig {
    methods?: HTTPMethod[]
  }

  interface GatewayServiceOptions extends mrapi.GatewayServiceConfig {
    prefix?: string
    proxy?: any
    close?: any
  }

  interface GatewayOptions {
    app: Options
  }
}

export { mrapi }

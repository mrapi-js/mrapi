import type mrapi from '@mrapi/types'
import type { app } from '@mrapi/app'
import type { HTTPMethod } from '@mrapi/router'

declare module '@mrapi/types' {
  interface GatewayServiceConfig {
    methods?: HTTPMethod[]
  }

  interface GatewayOptions {
    app: app.Options
  }
}

export { mrapi }

export interface GatewayServiceOptions extends mrapi.GatewayServiceConfig {
  prefix?: string
  proxy?: any
  close?: any
}

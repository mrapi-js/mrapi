import { OptionsData } from 'express-graphql'

export interface ServerOptions {
  host?: string
  port?: number
  tenantIdentity?: string
}

export type RouteOptions = OptionsData & {}

export interface DefaultTenant {
  name?: string
  url?: string
}

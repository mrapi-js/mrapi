import { OptionsData } from 'express-graphql'

export interface ServerOptions {
  host?: string
  port?: number
  tenantIdentity?: string
}

export type RouteOptions = OptionsData & {
  prismaClient?: string
}

export interface DefaultTenant {
  name?: string
  url?: string
}

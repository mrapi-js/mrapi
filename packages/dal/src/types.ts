import { OptionsData } from 'express-graphql'

export interface ServerOptions {
  host?: string
  port?: number
  tenantIdentity?: string
}

export type graphqlOptions = OptionsData

export interface openAPIOptions {
  dependencies?: {
    [name: string]: Function | Promise<Function>
  }
  oasDir: string
  validateApiDoc?: boolean
}

export interface RouteOptions {
  graphql?: graphqlOptions
  openAPI?: openAPIOptions
  enableRepeat?: boolean
  prismaClientDir?: string
}

export interface DefaultTenant {
  name?: string
  url?: string
}

export interface DALSchemaOptions {
  nexusDir?: string
  prismaClientDir?: string
  defaultTenant?: DefaultTenant
  graphql?: {
    enable?: boolean
    options?: graphqlOptions
  }
  openAPI?:
    | {
        enable?: true
        options: openAPIOptions
      }
    | {
        enable: false
        options?: openAPIOptions
      }
}

export interface DALOption extends DALSchemaOptions {
  name: string
}

export type DALOptions = DALOption[]

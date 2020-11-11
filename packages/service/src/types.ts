import type { Service } from '.'
import type mrapi from '@mrapi/types'
import type { app, App } from '@mrapi/app'
import type { GraphQLSchema } from 'graphql'
import type { graphql } from '@mrapi/graphql'

interface ServiceConfig {
  app: App
  logEndpoints: boolean
  graphql: {
    stitching?: boolean | string[]
  }
  logger: app.LoggerOptions
}

declare module '@mrapi/types' {
  interface Request extends app.Request {}

  interface Response extends app.Response {}

  interface Endpoint {
    name?: string
    type: string
    path: string
    playground?: boolean
  }

  interface Config extends ServiceConfig {}

  interface PartialConfig extends Partial<ServiceConfig> {}

  interface ServiceConfigInput extends Partial<mrapi.Config> {}

  interface GetSchemaParams {
    customPath: string
    generatedPath: string
    datasourcePath: string
    contextFile: string
    plugins: string[]
    mock: any
  }

  interface CreateContextParams extends graphql.ContextParams {
    service: Service
  }

  interface GetSchemaFn {
    (args: GetSchemaParams): GraphQLSchema | Promise<GraphQLSchema>
  }
}

export { mrapi }

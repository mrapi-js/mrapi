import type { Service } from '.'
import type mrapi from '@mrapi/types'
import type { app, App } from '@mrapi/app'
import type { GraphQLSchema } from 'graphql'
import type { graphql } from '@mrapi/graphql'

interface ServiceConfig {
  app?: App
  logEndpoints: boolean
  /**
   * Extra GraphQL options. (e.g.: stitching)
   *
   * @type {({
   *     stitching?: boolean | string[]
   *   })}
   * @memberof ServiceConfig
   */
  graphql: {
    stitching?: boolean | string[]
  }
  /**
   * Logger options
   *
   * @type {app.LoggerOptions}
   * @memberof ServiceConfig
   */
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

  interface Config extends Partial<ServiceConfig> {}

  // interface PartialConfig extends Partial<ServiceConfig> {}

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

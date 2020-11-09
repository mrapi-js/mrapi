import type { GraphQLSchema } from 'graphql'
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
    playground?: boolean
  }

  interface ServiceConfig extends mrapi.Config {
    logEndpoints: boolean
    graphql?: {
      stitching?: boolean | string[]
    }
  }

  interface GetSchemaParams {
    customPath: string
    generatedPath: string
    datasourcePath: string
    contextFile: string
    plugins: string[]
    mock: any
  }

  interface GetSchemaFn {
    (args: GetSchemaParams): GraphQLSchema | Promise<GraphQLSchema>
  }
}

export { mrapi }

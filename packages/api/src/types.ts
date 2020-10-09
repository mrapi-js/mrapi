import type mrapi from '@mrapi/types'
import type { YamlConfig } from '@graphql-mesh/types'
import type { Server, IncomingMessage, ServerResponse } from 'http'
import type { FastifyRequest, FastifyInstance, FastifyReply } from 'fastify'

export type { GraphQLSchema } from 'graphql'
export type { ExecuteMeshFn } from '@graphql-mesh/runtime'

declare module '@mrapi/types' {
  namespace api {
    interface Options {
      logger?: mrapi.LoggerOptions
      // config for graphql-mesh: https://github.com/Urigo/graphql-mesh/blob/master/packages/types/src/config.ts#L8
      service?: MeshConfig
      meshConfigOuputPath?: string
    }

    type ServerType = 'standalone' | 'combined'
    type App = FastifyInstance<Server, IncomingMessage, ServerResponse>
    interface Request extends FastifyRequest {}
    interface Response extends FastifyReply {}
    interface Context {
      request: Request
      reply: Response
      prisma: any
    }
    interface MeshConfig extends YamlConfig.Config {}
  }
}

export { mrapi }

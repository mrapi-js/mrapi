import fastify from 'fastify'
import {
  App,
  GraphQLSchema,
  ExecuteMeshFn,
  HttpRequest,
  DefaultConfig,
  HttpReply,
} from '../types'

export default class Server {
  app: App
  options: DefaultConfig
  constructor(options: DefaultConfig) {
    this.app = fastify()
    this.options = options
  }

  async loadOpenapi() {}

  async loadGraphql(schema: GraphQLSchema, execute: ExecuteMeshFn) {
    await this.app.register(require('fastify-gql'), {
      schema,
      path: '/graphql',
      ide: 'playground',
      context: async (request: HttpRequest, reply: HttpReply) => {
        return {
          request,
          reply,
          execute,
        }
      },
    })
  }

  async start(): Promise<string> {
    const addr = await this.app.listen(this.options.server.port)
    console.log(`Server listen: ${addr}`)
    return addr
  }
}

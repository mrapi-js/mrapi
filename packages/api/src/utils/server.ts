import fastify from 'fastify'
import path from 'path'
import logger from './logger'
import {
  App,
  GraphQLSchema,
  ExecuteMeshFn,
  HttpRequest,
  MrapiConfig,
  HttpReply,
} from '../types'

export default class Server {
  app: App
  options: MrapiConfig
  baseDir: string
  constructor(options: MrapiConfig) {
    this.baseDir = process.cwd()
    this.app = fastify(
      Object.assign({}, options.server.options, { logger: logger }),
    )
    this.options = options
  }

  /**
   * decription: add sign route to app
   *
   * @param {Object} route route option
   *
   * @returns {Void}
   */
  addRoute(route: any) {
    this.app.route({
      ...route,
      url: `${this.options.openapi.prefix}${route.url}`,
      handler: async function (request, reply) {
        return route.handler({ reply, request })
      },
    })
  }

  /**
   * decription: load custom openapi
   *
   *
   * @returns {Void}
   */
  async loadOpenapi() {
    // load custom openapi
    const customRoutes = require(path.join(
      this.baseDir,
      this.options.openapi.dir,
    ))
    Object.keys(customRoutes).forEach((key) => {
      customRoutes[key].forEach((route: any) => {
        this.addRoute(route)
      })
    })

    // type equal standalone, forward request to dalServer
    if (this.options.server.type === 'standalone') {
      await this.app.register(require('fastify-reply-from'), {
        base: this.options.openapi.dalBaseUrl,
      })
      this.app.route({
        method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
        url: '/*',
        handler: function (request, reply: any) {
          reply.from(request.raw.url)
        },
      })
    }
  }

  /**
   * decription: load custom graphql to app
   *
   * @param {Object} schema GraphqlSchema
   * @param {Function} execute graphql-mesh exec function
   *
   * @returns {Void}
   */
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

  /**
   * decription: start server
   *
   *
   * @returns {Promise} listen address
   */
  async start(): Promise<string> {
    const addr = await this.app.listen(this.options.server.port)
    return addr
  }
}

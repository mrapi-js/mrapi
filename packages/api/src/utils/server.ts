import fastify from 'fastify'
import path from 'path'
import logger from './logger'
import {
  App,
  GraphQLSchema,
  ExecuteMeshFn,
  HttpRequest,
  HttpReply,
  ApiOptions,
} from '../types'

export default class Server {
  app: App
  options: ApiOptions
  baseDir: string
  prismaPaths: Map<string, string>

  constructor(options: ApiOptions) {
    this.options = options
    this.baseDir = process.cwd()
    this.prismaPaths = new Map()
    this.app = fastify(
      Object.assign({}, this.options.server.options, { logger: logger }),
    )
  }

  /**
   * decription: add sign route to app
   *
   * @param {Object} route route option
   * @param {Object} dal dal instance
   *
   * @returns {Void}
   */
  addRoute(route: any, dal?: any) {
    const { options, app } = this
    app.route({
      ...route,
      url: `${options.openapi.prefix}${route.url}`,
      handler: async function (request: HttpRequest, reply: HttpReply) {
        let prisma: any
        const ret = {
          request,
          reply,
          prisma,
        }
        // 访问的租户
        const tenant = request.headers[options.tenantIdentity]
        // 访问的DB
        const name = request.headers[options.schemaIdentity]
        logger.debug(
          `[Route] DB: ${JSON.stringify(name)}, Tenant: ${JSON.stringify(
            tenant,
          )}`,
        )
        if (!dal) return route.handler(ret)
        return dal.getPrisma(name, tenant).then((prisma: any) => {
          ret.prisma = prisma
          return route.handler(ret)
        })
      },
    })
  }

  /**
   * decription: load custom openapi
   *
   * @param {Object} dal dal instance
   *
   * @returns {Void}
   */
  async loadOpenapi(dal?: any) {
    const { options, app, baseDir } = this
    // load custom openapi
    const customRoutes = require(path.join(baseDir, options.openapi.dir))
    Object.keys(customRoutes).forEach((key) => {
      customRoutes[key].forEach((route: any) => {
        this.addRoute(route, dal)
      })
    })

    // type equal standalone, forward request to dalServer
    if (options.server.type === 'standalone') {
      await app.register(require('fastify-reply-from'), {
        base: options.openapi.dalBaseUrl,
      })
      app.route({
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
   * @param {Object} dal dal instance
   *
   * @returns {Void}
   */
  async loadGraphql(
    schema: GraphQLSchema,
    execute: ExecuteMeshFn | undefined,
    dal?: any,
  ) {
    const { options } = this
    await this.app.register(require('fastify-gql'), {
      schema,
      path: `${options.graphql.path}/:name`,
      ide: options.graphql.playground,
      context: async (request: HttpRequest, reply: HttpReply) => {
        let prisma: any
        const ret = {
          request,
          reply,
          execute,
          prisma,
        }
        // 访问的租户
        const tenant = request.headers[this.options.tenantIdentity]
        // 访问的DB
        const name: any = (request.params as object & { name: () => any }).name
        logger.debug(`[Route] DB: ${name}, Tenant: ${JSON.stringify(tenant)}`)
        if (!name || !dal) return ret
        return dal.getPrisma(name, tenant).then((prisma: any) => {
          ret.prisma = prisma
          return ret
        })
      },
      errorHandler(err: Error) {
        // TODO
        logger.error(err)
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
    const addr = await this.app.listen(this.options.server.port, '0.0.0.0')
    logger.info(`Routes Tree\n${this.app.printRoutes()}`)
    return addr
  }
}

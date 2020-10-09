import type { FastifyError } from 'fastify'
import type { MercuriusOptions } from 'mercurius'
import type { mrapi, GraphQLSchema, ExecuteMeshFn } from './types'

import path from 'path'
import fastify from 'fastify'
import { GraphQLError } from 'graphql'
import { getLogger } from '@mrapi/common'

export default class Server {
  app: mrapi.api.App
  baseDir: string
  prismaPaths: Map<string, string>

  constructor(public options: mrapi.api.Options, public logger: mrapi.Logger) {
    this.baseDir = process.cwd()
    this.prismaPaths = new Map()
    this.logger = getLogger(logger, options.logger)
    this.app = fastify(
      Object.assign({}, this.options.server.options, { logger: this.logger }),
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
    this.app.route({
      ...route,
      url: `${this.options.openapi.prefix}${route.url}`,
      handler: async (
        request: mrapi.api.Request,
        reply: mrapi.api.Response,
      ) => {
        let prisma: any
        const ret = {
          request,
          reply,
          prisma,
        }
        // 访问的租户
        const tenant = request.headers[this.options.tenantIdentity]
        // 访问的DB
        const name = request.headers[this.options.schemaIdentity]
        this.logger.debug(
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
   * decription: load fastify plugins
   *
   *
   * @returns {Void}
   */
  loadPlugins() {
    if (!this.options.server.plugins) {
      return
    }

    for (const [name, options] of Object.entries(this.options.server.plugins)) {
      this.app.register(require(name), options || {})
    }
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
    if (!options.openapi) {
      return
    }

    // load custom openapi
    if (options.openapi.dir) {
      const customRoutes = require(path.join(baseDir, options.openapi.dir))
      Object.keys(customRoutes).forEach((key) => {
        customRoutes[key].forEach((route: any) => {
          this.addRoute(route, dal)
        })
      })
    }

    // type equal standalone, forward request to dalServer
    if (options.server.type === 'standalone') {
      await app.register(require('fastify-reply-from'), {
        base: options.openapi.dalBaseUrl,
      })
      app.route({
        method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
        url: '/*',
        handler: (request, reply: any) => {
          reply.from(request.raw.url)
        },
      })
    }

    this.logger.info('[Start] load openapi done')
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
    if (!this.options.graphql) {
      return
    }

    const mercuriusOptions: MercuriusOptions = {
      schema,
      routes: true,
      path: `${this.options.graphql.path}/:name`,
      // graphiql: '',
      ide: this.options.graphql.playground,
      context: async (
        request: mrapi.api.Request,
        reply: mrapi.api.Response,
      ) => {
        const ctx = {
          request,
          reply,
          execute,
        }

        // 访问的租户
        const tenant = request.headers[this.options.tenantIdentity]
        // 访问的DB
        const dbName: any = (request.params as object & { name: () => any })
          .name

        this.logger.debug(
          `[Route] DB: ${dbName}, Tenant: ${JSON.stringify(tenant)}`,
        )

        if (!dbName || !dal) {
          return ctx
        }

        return {
          ...ctx,
          tenant,
          dbName,
          prisma: await dal.getPrisma(dbName, tenant),
        }
      },
      errorHandler: (
        error: FastifyError,
        request: mrapi.api.Request,
        reply: mrapi.api.Response,
      ) => {
        // TODO
        // this.log.error(err)
        // log.info({ reply, error })

        this.logger.error(error)
        return {
          errors: [new GraphQLError(error.message)],
          // TS_SPECIFIC: TData. Motivation: https://github.com/graphql/graphql-js/pull/2490#issuecomment-639154229
          data: null,
          extensions: [],
        }
      },
    }
    await this.app.register(require('mercurius'), mercuriusOptions)

    this.logger.info('[Start] load graphql done')
  }

  /**
   * decription: start server
   *
   *
   * @returns {Promise} listen address
   */
  async start(): Promise<string> {
    this.loadPlugins()
    const { host, port } = this.options.server
    const addr = await this.app.listen(port, host)
    this.logger.info(`Routes Tree\n${this.app.printRoutes()}`)
    return addr
  }
}

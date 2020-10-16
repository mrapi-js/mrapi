import type { MercuriusOptions } from 'mercurius'
import type { mrapi, GraphQLSchema, ExecuteMeshFn } from './types'

import { join } from 'path'
import fastify from 'fastify'
import mercurius from 'mercurius'
import { flatten, getLogger, requireResolve } from '@mrapi/common'

export default class Server {
  /**
   * FastifyInstance
   *
   * @type {mrapi.api.App}
   * @memberof Server
   */
  app: mrapi.api.App
  cwd = process.cwd()

  constructor(public options: mrapi.api.Options, public logger: mrapi.Logger) {
    this.logger = getLogger(logger, {
      ...(options?.logger || {}),
      name: 'mrapi-api-server',
    })
    this.app = fastify(
      Object.assign({}, this.options.server.options, { logger: this.logger }),
    )
  }

  /**
   * decription: add sign route to app
   *
   * @private
   * @param {Object} route route option
   * @param {Object} dal dal instance
   *
   * @returns {Void}
   */
  private addRoute(route: any, dal?: any) {
    // TODO: review
    this.app.route({
      ...route,
      url: `${this.options.openapi.prefix}${route.url}`,
      handler: async (
        request: mrapi.api.Request,
        reply: mrapi.api.Response,
      ) => {
        const context = {
          request,
          reply,
        }

        const tenantName = request.headers[this.options.tenantIdentity]
        const serviceName = request.headers[this.options.schemaIdentity]
        this.logger.debug(
          `[Route] serviceName: ${serviceName}, tenantName: ${tenantName}`,
        )

        if (!dal) {
          return route.handler(context)
        }

        return dal
          .getDBClient(serviceName, tenantName)
          .then((prisma: any) => route.handler({ ...context, prisma }))
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
      const pluginPath = requireResolve(name)
      if (!pluginPath) {
        this.logger.error(
          `Cannot find plugin '${name}', please install it manually.`,
        )
      } else {
        this.app.register(require(pluginPath), options || {})
      }
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
    const { options, cwd } = this
    if (!options.openapi) {
      return
    }

    // type equal standalone, forward request to dalServer
    if (options.server.type === 'standalone') {
      await this.app.register(require('fastify-reply-from'), {
        base: options.openapi.url,
      })
      this.app.route({
        method: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
        url: '/*',
        handler: (request, reply: any) => {
          reply.from(request.raw.url)
        },
      })

      return
    }

    // load custom openapi
    const dir =
      options.openapi.dir && requireResolve(join(cwd, options.openapi.dir))

    if (!dir) {
      return
    }

    const custom = require(dir)
    const content = custom.default || custom
    const routes = Array.isArray(content)
      ? content
      : typeof content === 'object'
      ? flatten([...Object.values(content)])
      : typeof content === 'function'
      ? await content(this)
      : null

    if (!routes) {
      return
    }

    for (const route of routes) {
      try {
        this.addRoute(route, dal)
      } catch (err) {
        this.logger.error(`addRoute Error: ${err.message}`)
      }
    }

    this.logger.debug('[Start] load openapi done')
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
      context: async (
        request: mrapi.api.Request,
        reply: mrapi.api.Response,
      ) => {
        const ctx = {
          request,
          reply,
          execute,
        }

        const tenantName = request.headers[this.options.tenantIdentity]
        const serviceName: any = (request.params as object & {
          name: () => any
        }).name

        this.logger.debug(
          `[Route] serviceName: ${serviceName}, tenantName: ${tenantName}`,
        )

        if (!dal || !serviceName) {
          return { ...ctx, tenantName }
        }
        // this should invoke after dal.getSchemas()
        const prisma = await dal.getDBClient(serviceName, tenantName)

        return {
          ...ctx,
          prisma,
          tenantName,
          serviceName,
        }
      },
      ...this.options.graphql,
      // TODO: use a default endpoint name
      path: `${this.options.graphql.path}/:name`,
      schema,
    }
    await this.app.register(mercurius, mercuriusOptions)
    this.logger.debug('[Start] load graphql done')
  }

  /**
   * decription: start server
   *
   *
   * @returns {Promise} listen address
   */
  async start() {
    this.loadPlugins()
    const { host, port } = this.options.server
    const address = await this.app.listen(port, host)

    this.logger.info(`Routes Tree\n${this.app.printRoutes()}`)
    return { address }
  }
}

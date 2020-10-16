import type http from 'http'
import type { mrapi } from './types'
import type { Express } from 'express'

import { join } from 'path'
import express from 'express'
import { GraphQLSchema } from 'graphql'
import swaggerUi from 'swagger-ui-express'
import { graphqlHTTP } from 'express-graphql'
import { dependenciesPlugins } from '@mrapi/oas'
import { graphqlUploadExpress } from 'graphql-upload'
import { fs, merge, requireResolve } from '@mrapi/common'
import { initialize as initializeOpenAPI } from 'express-openapi'

import { loggingMiddleware } from './middleware/logging'
import { defaults, makeGraphqlExtensions } from './config'

/**
 * Server of DAL
 *
 * @export
 * @class Server
 */
export default class Server {
  /**
   * Express instance
   *
   * @type {Express}
   * @memberof Server
   */
  app: Express
  /**
   * Http server instance
   *
   * @type {http.Server}
   * @memberof Server
   */
  server: http.Server
  private readonly routes: Set<string> = new Set()

  constructor(
    public options: mrapi.dal.ServerOptions,
    public getDBClient: mrapi.dal.GetDBClientFn,
    public logger: mrapi.Logger,
  ) {
    this.app = express()
    this.options.middlewares.push({
      fn: loggingMiddleware,
    })
    this.applyMiddlewares()
  }

  /**
   * Start the server
   *
   * @param {mrapi.dal.ServerOptions} options
   * @returns
   * @memberof Server
   */
  start(options: mrapi.dal.ServerOptions) {
    if (options?.host) {
      this.options.host = options.host
    }
    if (options?.port) {
      this.options.port = options.port
    }

    const { port, host } = this.options
    this.server = this.app.listen(port, host)

    this.logger.info(`🚀 Server listening at ${this.getUri()}`)

    return this.app
  }

  /**
   * Stop the server
   *
   * @memberof Server
   */
  stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }

    this.server.close()

    this.logger.warn(`\n🚫 Server closed. ${this.getUri()}\n`)
  }

  /**
   * Add routes to express app
   *
   * @param {(mrapi.dal.ServerOptions & mrapi.dal.ServiceOptions)} {
   *     name,
   *     graphql,
   *     openapi,
   *     paths,
   *     enableRouteRepeat,
   *   }
   * @returns
   * @memberof Server
   */
  addRoute({
    name,
    graphql,
    openapi,
    paths,
    enableRouteRepeat,
  }: mrapi.dal.ServerOptions & mrapi.dal.ServiceOptions) {
    // Fix: Repeat to add routes
    if (enableRouteRepeat && this.routes.has(name)) {
      this.removeRoute(name)
    }

    this.routes.add(name)
    const addressGraphql = this.addGraphql(name, graphql)
    const addressOpenapi = this.addOpenapi(name, openapi, paths)

    return addressGraphql || addressOpenapi
      ? {
          ...(addressGraphql ? { graphql: addressGraphql } : {}),
          ...(addressOpenapi ? { openapi: addressOpenapi } : {}),
        }
      : null
  }

  /**
   * Remove route from express app
   *
   * @param {string} name
   * @returns {boolean}
   * @memberof Server
   */
  removeRoute(name: string): boolean {
    const routes = this.app._router.stack
    const endpointGraphql = this.options.endpoint.graphql
    const endpointOpenapi = this.options.endpoint.openapi
    const graphqlPath = `/${endpointGraphql}/${name}`
    const openAPIPath = `/${endpointOpenapi}/${name}`

    const removeNum = {
      [endpointGraphql]: 0,
      [endpointOpenapi]: 0,
    }
    let index = 0
    while (index < routes.length) {
      const route = routes[index]

      // graphqlHTTP name
      if (
        route.name === 'graphqlMiddleware' &&
        route.regexp.test(graphqlPath)
      ) {
        routes.splice(index, 1)

        removeNum[endpointGraphql] === 0 &&
          this.logger.warn(
            `🚫 [${name}] Termination a GraphQL API of route at: ${graphqlPath}`,
          )
        removeNum[endpointGraphql]++
      }
      // openAPI name
      else if (
        [
          'bound dispatch',
          'swaggerInitFn',
          'serveStatic',
          'swaggerUiSetup',
        ].includes(route.name)
      ) {
        const str = route.regexp.source.replace(
          `^\\/${endpointOpenapi}\\/${name}\\/`,
          '',
        )
        if (str.length === route.regexp.source.length) {
          index++
          continue
        }

        routes.splice(index, 1)

        removeNum[endpointOpenapi] === 0 &&
          this.logger.warn(
            `🚫 [${name}] Terminated: ${openAPIPath}; ${openAPIPath}/swagger`,
          )
        removeNum[endpointOpenapi]++
      } else {
        index++
      }
    }

    if (removeNum[endpointGraphql] > 0 || removeNum[endpointOpenapi] > 0) {
      this.routes.delete(name)
      return true
    }

    this.logger.error(`Route '/${name}' not found`)
    return false
  }

  private async getTenantIdentity(
    req: http.IncomingMessage,
    res?: http.ServerResponse,
    params?: any,
  ) {
    const { tenantIdentity } = this.options
    if (!tenantIdentity) {
      this.logger.error(
        `"tenantIdentity" should be a string or funtion. Received: ${tenantIdentity}`,
      )
    }

    return typeof tenantIdentity === 'function'
      ? await tenantIdentity(req, res, params)
      : req.headers[tenantIdentity]
  }

  private addGraphql(
    serviceName: string,
    graphqlOptions: mrapi.dal.GraphqlOptions,
  ) {
    if (typeof graphqlOptions !== 'object') {
      return null
    }

    const endpoint = this.resolveServicePath(serviceName, 'graphql')

    this.app.post(
      endpoint,
      graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
      graphqlHTTP(async (req, res, params) => {
        const createContext = async () => {
          const tenantName: any = await this.getTenantIdentity(req, res, params)
          return {
            startTime: Date.now(),
            prisma: await this.getDBClient(serviceName, tenantName),
          }
        }

        return {
          // set a default empty schema
          schema: new GraphQLSchema({
            query: null,
          }),
          context: await createContext(),
          extensions: makeGraphqlExtensions(this.logger),
          ...graphqlOptions,
          graphiql: false,
        }
      }),
    )

    this.logger.info(
      `⭐️ [${serviceName}] GraphQL service:     ${this.getUri()}${endpoint}`,
    )

    if (graphqlOptions.playground) {
      // apply playground middleware
      const expressPlayground = require('graphql-playground-middleware-express')
        .default
      const path =
        typeof graphqlOptions.playground === 'string' &&
        graphqlOptions.playground.trim()
          ? graphqlOptions.playground.trim()
          : '/playground'
      this.app.get(path, expressPlayground({ endpoint }))

      this.logger.info(
        `⭐️ [${serviceName}] GraphQL playground:  ${this.getUri()}${path}`,
      )
    }

    return {
      path: endpoint,
    }
  }

  private addOpenapi(
    serviceName: string,
    openapiOptions: mrapi.dal.OpenapiOptions,
    paths: mrapi.dal.ServicePaths,
  ) {
    if (typeof openapiOptions !== 'object') {
      return null
    }
    const output = paths.outputOpenapi
    const outputPaths = join(output, 'paths')
    const outputDefinitions = join(output, 'definitions')
    const definitionsPath = requireResolve(outputDefinitions)

    if (!definitionsPath) {
      this.logger.error(
        `OpenAPI definitions for service "${serviceName}" not found. Please run "mrapi generate" first.`,
      )
      process.exit()
    }

    const endpoint = this.resolveServicePath(serviceName, 'openapi')
    const definitions = require(definitionsPath) || {}
    const getDBClient = async (req: any) => {
      // TODO: more params
      const tenantName: any = await this.getTenantIdentity(req)
      return this.getDBClient(serviceName, tenantName)
    }
    const opts = merge(openapiOptions.docs, {
      ...openapiOptions.docs,
      app: this.app,
      validateApiDoc:
        typeof openapiOptions.validateApiDoc === 'undefined'
          ? true
          : openapiOptions.validateApiDoc,
      apiDoc: {
        swagger: '2.0',
        basePath: endpoint,
        info: {
          title: `[${serviceName}] Started openAPI.`,
          version: '1.0.0',
        },
        paths: {},
        definitions: definitions.default || definitions,
      },
      dependencies: {
        ...(openapiOptions.dependencies || {}),
        getDBClient,
        mrapiFn: dependenciesPlugins({
          getDBClient,
        }),
      },
      paths: outputPaths,
      pathsIgnore: new RegExp('.(spec|test)$'),
    })
    const openAPIInstance = initializeOpenAPI(opts)
    const apiDoc = openAPIInstance.apiDoc

    this.app.use(
      `${endpoint}/swagger`,
      swaggerUi.serve,
      function swaggerUiSetup(...params: [any, any, any]) {
        swaggerUi.setup(apiDoc)(...params)
      },
    )

    this.logger.info(
      `⭐️ [${serviceName}] OpenAPI service:     ${this.getUri()}${endpoint}`,
    )
    this.logger.info(
      `⭐️ [${serviceName}] OpenAPI document:    ${this.getUri()}${endpoint}/swagger`,
    )

    // generate openapi/docs.json
    fs.outputFileSync(
      join(output, 'docs.json'),
      JSON.stringify(apiDoc, null, 2),
    )

    return {
      path: endpoint,
      docs: `${endpoint}/swagger`,
    }
  }

  private async applyMiddlewares() {
    this.app.use(function (err: any, req: any, res: any, next: any) {
      console.error(err.stack)
      res.status(500).send('Something broke!')
    })

    for (const { fn, options } of this.options.middlewares) {
      const middleware = fn(options, this)
      this.app.use(middleware)
    }
  }

  private readonly getUri = () => {
    const { port, host } = this.options
    return `http://${host}:${port}`
  }

  private resolveServicePath(name: string, type: 'graphql' | 'openapi') {
    return `/${this.options.endpoint[type]}${
      name === defaults.serviceName ? '' : `/${name}`
    }`
  }
}

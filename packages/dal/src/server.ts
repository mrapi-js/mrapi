import type http from 'http'
import type { mrapi } from './types'

import { join } from 'path'
import { GraphQLSchema } from 'graphql'
import swaggerUi from 'swagger-ui-express'
import express, { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'
import { dependenciesPlugins } from '@mrapi/oas'
import { fs, requireResolve } from '@mrapi/common'
import { initialize as initializeOpenAPI } from 'express-openapi'

import { defaults } from './config'
import { loggingMiddleware } from './middleware/logging'

type GetPrismaType = (
  name: string,
  dbName: string,
) => any | Promise<(name: string, dbName: string) => any>

export default class Server {
  public app: Express
  public server: http.Server
  private readonly routes: Set<string> = new Set()

  constructor(
    public options: mrapi.dal.ServerOptions,
    public getPrisma: GetPrismaType,
    public logger: mrapi.Logger,
  ) {
    this.app = express()
    this.options.middlewares.push({
      fn: loggingMiddleware,
    })
    this.applyMiddlewares()
  }

  start(options: mrapi.dal.ServerOptions) {
    if (options?.host) {
      this.options.host = options.host
    }
    if (options?.port) {
      this.options.port = options.port
    }

    const { port, host } = this.options
    this.server = this.app.listen(port, host)

    this.logger.info(`🚀 Server ready at: ${this.getUri()}`)

    return this.app
  }

  stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }

    this.server.close()

    this.logger.info(`\n🚫 Server closed. ${this.getUri()}\n`)
  }

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
    this.addGraphql(name, graphql)
    this.addOpenapi(name, openapi, paths)
  }

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
          this.logger.info(
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
          this.logger.info(
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

  private addGraphql(name: string, graphqlOptions: mrapi.dal.GraphqlOptions) {
    if (typeof graphqlOptions !== 'object') {
      return
    }

    const endpoint = this.resolveServicePath(name, 'graphql')
    const extensions = ({
      document,
      variables,
      operationName,
      result,
      context,
    }: any) => {
      if (Array.isArray(result.errors)) {
        result.errors.map((error: Error) => this.logger.error(error.stack))
      }
      return {
        ...(context.startTime
          ? { duation: Date.now() - context.startTime }
          : {}),
      }
    }

    this.app.use(
      endpoint,
      graphqlHTTP(async (req, res, params) => {
        const createContext = async () => {
          const tenantName: any = await this.getTenantIdentity(req, res, params)
          return {
            startTime: Date.now(),
            prisma: await this.getPrisma(name, tenantName),
          }
        }

        return {
          // set a default empty schema
          schema: new GraphQLSchema({
            query: null,
          }),
          graphiql: { headerEditorEnabled: true },
          context: await createContext(),
          extensions,
          ...graphqlOptions,
        }
      }),
    )

    this.logger.info(
      `⭐️ [${name}] GraphQL service:  ${this.getUri()}${endpoint}`,
    )
  }

  private addOpenapi(
    name: string,
    openapiOptions: mrapi.dal.OpenapiOptions,
    paths: mrapi.dal.ServicePaths,
  ) {
    if (typeof openapiOptions !== 'object') {
      return
    }
    const output = paths.outputOpenapi

    const definitionsPath = requireResolve(join(output, 'definitions'))
    if (!definitionsPath) {
      this.logger.error(
        `OpenAPI definitions for service "${name}" not found. Please run "mrapi generate" first.`,
      )
      process.exit(1)
    }

    const endpoint = this.resolveServicePath(name, 'openapi')
    const definitions = require(definitionsPath) || {}
    const getPrisma = async (req: any) => {
      // TODO: more params
      const tenantName: any = await this.getTenantIdentity(req)
      return this.getPrisma(name, tenantName)
    }
    const opts = {
      ...openapiOptions.docs,
      app: this.app,
      // logger: this.logger,
      validateApiDoc:
        typeof openapiOptions.validateApiDoc === 'undefined'
          ? true
          : openapiOptions.validateApiDoc,
      apiDoc: {
        swagger: '2.0',
        basePath: endpoint,
        info: {
          title: `[${name}] Started openAPI.`,
          version: '1.0.0',
        },
        paths: {},
        definitions: definitions.default || definitions,
      },
      dependencies: {
        ...(openapiOptions.dependencies || {}),
        getPrisma,
        mrapiFn: dependenciesPlugins({
          getPrisma,
        }),
      },
      paths: join(output, 'paths'),
      pathsIgnore: new RegExp('.(spec|test)$'),
    }
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
      `⭐️ [${name}] OpenAPI service:  ${this.getUri()}${endpoint}`,
    )
    this.logger.info(
      `⭐️ [${name}] OpenAPI document: ${this.getUri()}${endpoint}/swagger`,
    )

    // generate openapi/docs.json
    fs.outputFileSync(
      join(output, 'docs.json'),
      JSON.stringify(apiDoc, null, 2),
    )
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

import chalk from 'chalk'
import express, { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'
import { initialize as initializeOpenAPI } from 'express-openapi'
import swaggerUi from 'swagger-ui-express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import type http from 'http'

import { merge, formation, writeFileSync } from '@mrapi/common'
import { dependenciesPlugins } from '@mrapi/oas'
import { graphqlAPIPrefix, openAPIPrefix } from './constants'
import type { ServerOptions, RouteOptions } from './types'

type GetPrismaType = (
  name: string,
  dbName: string,
) => any | Promise<(name: string, dbName: string) => any>

const defaultOptions: ServerOptions = {
  host: '0.0.0.0',
  port: 1358,
  tenantIdentity: 'mrapi-pmt',
}

export default class Server {
  public app: Express

  public server: http.Server

  private options: ServerOptions

  private readonly getPrisma: GetPrismaType

  private readonly routes: Set<string> = new Set()

  constructor(options: ServerOptions = {}, getPrisma: GetPrismaType) {
    this.options = merge(defaultOptions, options)

    this.getPrisma = getPrisma

    this.app = express()

    this.app.use(cors())
    this.app.use(bodyParser.json())
  }

  start(options: ServerOptions = {}) {
    if (options?.host) {
      this.options.host = options.host
    }
    if (options?.port) {
      this.options.port = options.port
    }

    const { port, host } = this.options

    this.server = this.app.listen(port, host)

    console.log(`\n🚀 Server ready at: ${chalk.blue(this.getUri())}\n`)

    return this.app
  }

  private readonly getUri = () => {
    const { port, host } = this.options
    return `http://${host}:${port}`
  }

  stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }

    this.server.close()

    console.log(`\n🚫 Server closed. ${chalk.gray(this.getUri())}\n`)
  }

  addRoute(
    name: string,
    { graphql, openAPI, enableRepeat, prismaClientDir }: RouteOptions = {},
  ): boolean {
    // Fix: Repeat to add routes
    if (this.routes.has(name)) {
      if (enableRepeat) {
        this.removeRoute(name)
      } else {
        return false
      }
    }
    this.routes.add(name)

    const { tenantIdentity } = this.options

    console.log()

    // add graphqlAPI
    if (typeof graphql === 'object') {
      this.app.use(
        `/${graphqlAPIPrefix}/${name}`,
        graphqlHTTP(async (req, _res, _params) => {
          const createContext = async () => {
            const tenantName: any = req.headers[tenantIdentity]
            return { prisma: await this.getPrisma(name, tenantName) }
          }

          return {
            graphiql: { headerEditorEnabled: true },
            context: await createContext(),
            ...graphql,
          }
        }),
      )

      console.log(
        `⭐️ [${name}] Running a GraphQL API route at: ${chalk.blue(
          `/${graphqlAPIPrefix}/${name}`,
        )}`,
      )
    }

    // add openAPI
    if (typeof openAPI === 'object') {
      const getPrisma = async (req: any) => {
        const tenantName: string = req.headers[tenantIdentity]
        const prisma = await this.getPrisma(name, tenantName)
        return prisma
      }
      const definitions =
        require(path.join(openAPI.oasDir, 'definitions')) || {}
      const openAPIBasePath = `/${openAPIPrefix}/${name}`
      const openAPIInstance = initializeOpenAPI({
        validateApiDoc:
          typeof openAPI.validateApiDoc === 'undefined'
            ? true
            : openAPI.validateApiDoc,
        app: this.app,
        apiDoc: {
          swagger: '2.0',
          basePath: openAPIBasePath,
          info: {
            title: `[${name}] Started openAPI.`,
            version: '1.0.0',
          },
          paths: {},
          definitions: definitions.default || definitions,
        },
        dependencies: {
          ...(openAPI.dependencies || {}),
          getPrisma,
          mrapiFn: dependenciesPlugins({
            getPrisma,
          }),
        },
        paths: path.join(openAPI.oasDir, 'paths'),
        pathsIgnore: new RegExp('.(spec|test)$'),
      })
      this.app.use(
        `${openAPIBasePath}/swagger`,
        swaggerUi.serve,
        function swaggerUiSetup(...params: [any, any, any]) {
          swaggerUi.setup(openAPIInstance.apiDoc)(...params)
        },
      )

      console.log(
        `⭐️ [${name}] Running a openAPI route at: ${chalk.blue(
          openAPIBasePath,
        )}
⭐️ [${name}] Running a openAPI Swagger document at: ${chalk.blue(
          `${openAPIBasePath}/swagger`,
        )}`,
      )

      // generate apiDoc.json
      prismaClientDir &&
        writeFileSync(
          path.join(prismaClientDir, 'apiDoc.json'),
          formation(JSON.stringify(openAPIInstance.apiDoc), 'json', ''),
        )
    }

    console.log()

    return true
  }

  removeRoute(name: string): boolean {
    const routes = this.app._router.stack
    const graphqlPath = `/${graphqlAPIPrefix}/${name}`
    const openAPIPath = `/${openAPIPrefix}/${name}`

    console.log()

    const removeNum = {
      [graphqlAPIPrefix]: 0,
      [openAPIPrefix]: 0,
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

        removeNum[graphqlAPIPrefix] === 0 &&
          console.log(
            `🚫 [${name}] Termination a GraphQL API of route at: ${chalk.gray(
              graphqlPath,
            )}`,
          )
        removeNum[graphqlAPIPrefix]++
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
          `^\\/${openAPIPrefix}\\/${name}\\/`,
          '',
        )
        if (str.length === route.regexp.source.length) {
          index++
          continue
        }

        routes.splice(index, 1)

        removeNum[openAPIPrefix] === 0 &&
          console.log(
            `🚫 [${name}] Termination a openAPI of route at: ${chalk.gray(
              openAPIPath,
            )}
🚫 [${name}] Termination a openAPI Swagger document at: ${chalk.gray(
              `${openAPIPath}/swagger`,
            )}`,
          )
        removeNum[openAPIPrefix]++
      } else {
        index++
      }
    }

    if (removeNum[graphqlAPIPrefix] > 0 || removeNum[openAPIPrefix] > 0) {
      console.log()

      this.routes.delete(name)
      return true
    }

    console.error(`Route '/${name}' not found`)
    return false
  }
}

import chalk from 'chalk'
import express, { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'
import type http from 'http'

import { merge } from '@mrapi/common'
import { graphqlAPIPrefix, openAPIPrefix } from './constants'
import GraphQLToOpenAPIConverter from './utils/GraphQLToOpenAPIConverter'
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

  private readonly options: ServerOptions

  private readonly getPrisma: GetPrismaType

  constructor(options: ServerOptions = {}, getPrisma: GetPrismaType) {
    this.options = merge(defaultOptions, options)

    this.getPrisma = getPrisma

    this.app = express()
  }

  start() {
    const { port, host } = this.options
    this.server = this.app.listen(port, host)

    console.log(
      `\n🚀 Server ready at: ${chalk.blue(`http://${host}:${port}`)}\n`,
    )

    return this.app
  }

  stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }

    this.server.close()

    const { port, host } = this.options
    console.log(`\n🚫 Server closed. ${chalk.gray(`http://${host}:${port}`)}\n`)
  }

  addRoute(name: string, options: RouteOptions): boolean {
    const { tenantIdentity } = this.options

    // add graphqlAPI
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
          ...options,
        }
      }),
    )

    console.log(
      `\n⭐️ [${name}] Running a GraphQL API route at: ${chalk.blue(
        `/${graphqlAPIPrefix}/${name}`,
      )}\n`,
    )

    // TODO: ADD openAPI
    const routes = GraphQLToOpenAPIConverter(name, async (req) => {
      const tenantName: any = req.headers[tenantIdentity]
      const prisma = await this.getPrisma(name, tenantName)
      return prisma
    })

    for (const route of routes) {
      this.app.use(`/${openAPIPrefix}/${name}${route.url}`, async (req) => {
        const data = await route.handler(req)
        console.log(data)
        return data
      })
    }

    console.log(
      `\n⭐️ [${name}] Running a openAPI route at: ${chalk.blue(
        `/${openAPIPrefix}/${name}`,
      )}\n`,
    )

    return true
  }

  removeRoute(name: string): boolean {
    const routes = this.app._router.stack

    const idx = routes.findIndex((route: any) => {
      // graphqlHTTP name
      if (route.name === 'graphqlMiddleware') {
        return route.regexp.test(`/${graphqlAPIPrefix}/${name}`)
      }
      return false
    })
    if (idx !== -1) {
      routes.splice(idx, 1)

      console.log(
        `🚫 [${name}] Termination a GraphQL API of route at: ${chalk.gray(
          `/${graphqlAPIPrefix}/${name}`,
        )}`,
      )
      return true
    }

    console.error(`Route '/${name}' not found`)
    return false
  }
}

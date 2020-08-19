import chalk from 'chalk'
import express, { Express } from 'express'
import { graphqlHTTP, OptionsData } from 'express-graphql'
import type http from 'http'

import { merge, getPrismaClient } from '@mrapi/common'
import { graphqlAPIPrefix } from './constants'
import type PMTManage from './prisma/PMTManage'

export interface ServerOptions {
  host?: string
  port?: number
  tenantIdentity?: string
}

export type RouteOptions = OptionsData & {
  prismaClient: any
}

const defaultOptions: ServerOptions = {
  host: '0.0.0.0',
  port: 1358,
  tenantIdentity: 'mrapi-pmt',
}

export default class Server {
  public app: Express

  public server: http.Server

  private readonly options: ServerOptions

  private readonly pmtManage: PMTManage

  constructor(options: ServerOptions = {}, pmtManage: PMTManage) {
    this.options = merge(defaultOptions, options)

    this.pmtManage = pmtManage

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
    const PRISMA_CLIENT_OUTPUT = options.prismaClient

    // set PrismaClient
    const PrismaClient = getPrismaClient(options.prismaClient)
    delete options.prismaClient
    this.pmtManage.setPMT(name, {
      PrismaClient,
    })

    // add graphqlAPI
    this.app.use(
      `/${graphqlAPIPrefix}/${name}`,
      graphqlHTTP(async (req, _res, _params) => {
        const createContext = async () => {
          const dbName: any = req.headers[tenantIdentity]
          const prisma = await this.pmtManage
            .getPrisma(name, dbName)
            .catch((e: any) => {
              // TODO: 多租户异常时，保证 DEV 可以正常访问连接。
              if (process.env.NODE_ENV === 'production') {
                throw e
              }
              console.error(e)
              console.log(
                chalk.red(
                  `Error: Check to see if a multi-tenant identity "${tenantIdentity}" has been added to the "Request Headers".`,
                ),
              )
            })
          return { prisma }
        }

        // 感觉这样频繁变动会有问题，考虑后续此变量在 schema.prisma 中写死
        process.env.PRISMA_CLIENT_OUTPUT = PRISMA_CLIENT_OUTPUT

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
    // ...

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

      this.pmtManage.setPMT(name)

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

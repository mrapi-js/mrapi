import express, { Express } from 'express'
import {
  graphqlHTTP,
  // OptionsData
} from 'express-graphql'
import chalk from 'chalk'

import type http from 'http'

import { merge } from '@mrapi/common'
import createContext from './createContext'

export interface ServerOptions {
  host?: string
  port?: number
  tenantName?: string
}

export type RouteOptions = any // OptionsData

const defaultOptions: ServerOptions = {
  host: '0.0.0.0',
  port: 1358,
  tenantName: 'mrapi-mtn',
}

export default class Server {
  app: Express

  options: ServerOptions

  server: http.Server

  constructor(options: ServerOptions = {}) {
    this.options = merge(defaultOptions, options)

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
    const { tenantName } = this.options

    this.app.use(
      `/${name}`,
      graphqlHTTP(async (req, res, params) => {
        return {
          graphiql: { headerEditorEnabled: true },
          context: await createContext(req, res, params, { tenantName }),
          ...options,
        }
      }),
    )

    console.log(
      `\n⭐️ [${name}] Running a GraphQL API route at: ${chalk.blue(
        `/${name}`,
      )}\n`,
    )
    return true
  }

  removeRoute(name: string): boolean {
    const routes = this.app._router.stack

    const idx = routes.findIndex((route: any) => {
      // graphqlHTTP name
      if (route.name === 'graphqlMiddleware') {
        return route.regexp.test(`/${name}`)
      }
      return false
    })
    if (idx !== -1) {
      routes.splice(idx, 1)

      console.log(
        `🚫 [${name}] Termination a GraphQL API of route at: ${chalk.gray(
          `/${name}`,
        )}`,
      )
      return true
    }

    console.error(`Route '/${name}' not found`)
    return false
  }
}

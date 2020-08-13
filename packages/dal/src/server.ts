import express, { Express } from 'express'
import {
  graphqlHTTP,
  // OptionsData
} from 'express-graphql'
import chalk from 'chalk'

import { merge } from '@mrapi/common'

import type http from 'http'

export interface ServerOptions {
  host?: string
  port?: number
}

export type RouteOptions = any // OptionsData

const defaultOptions: ServerOptions = {
  host: '0.0.0.0',
  port: 1358,
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
    this.server.close()

    const { port, host } = this.options
    console.log(`\n🚫 Server closed. ${chalk.gray(`http://${host}:${port}`)}\n`)
  }

  addRoute(name: string, options: RouteOptions): boolean {
    this.app.use(
      `/${name}`,
      graphqlHTTP({
        graphiql: { headerEditorEnabled: true },
        ...options,
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

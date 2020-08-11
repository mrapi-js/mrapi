import express, { Express } from 'express'
import { graphqlHTTP, OptionsData } from 'express-graphql'

import { createContext } from './context'

interface ServerOption {
  host?: string
  port?: number
}

const defaultConfig = {
  host: '0.0.0.0',
  port: 1358,
}

export type RouteOptions = OptionsData

export default class Server {
  app: Express

  constructor() {
    this.app = express()
  }

  start({ host, port }: ServerOption) {
    const PORT = port || defaultConfig.port
    const HOST = host || defaultConfig.host
    this.app.listen(PORT, HOST)
    console.log(`Running a GraphQL API server at http://${HOST}:${PORT}`)
    return this.app
  }

  addRoute(name: string, options: RouteOptions) {
    this.app.use(
      `/${name}`,
      graphqlHTTP({
        ...options,
        context: createContext(),
        graphiql: { headerEditorEnabled: true },
      }),
    )
  }

  removeRoute(name: string) {
    const idx = this.app._router.stack.findIndex((r: any) => r.name === name)
    if (idx !== -1) {
      this.app._router.stack.splice(idx, 1)
    } else {
      console.error(`Route '${name}' not found`)
    }
  }
}

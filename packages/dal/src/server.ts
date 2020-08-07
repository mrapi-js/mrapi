import express, { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'

import { createContext } from './context'

export default class Server {
  app: Express

  constructor() {
    this.app = express()
  }

  start({ host = '0.0.0.0', port = 1358 } = {}) {
    const PORT = port || 1358
    const HOST = host || '0.0.0.0'
    this.app.listen(PORT, HOST)
    console.log(`Running a GraphQL API server at http://${HOST}:${PORT}`)
    return this.app
  }

  addRoute(name: string, options: { schema: any }) {
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
      console.error(`route '${name}' not found`)
    }
  }
}

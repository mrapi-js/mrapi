import 'reflect-metadata'
import fastify, { FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

import { getDBClient } from './db'
import { loadConfig } from './utils/tools'
import * as defaults from './config/defaults.json'
import registerGraphql from './middlewares/graphql'
import registerRest from './middlewares/rest'
import {
  DBClient,
  Config,
  Middleware,
  Hook,
  DBConfig,
  ServerConfig,
  SecurityConfig,
} from './types'

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})

export class Mrapi {
  app: FastifyInstance<Server, IncomingMessage, ServerResponse>
  cwd = process.cwd()
  db: DBClient
  config = defaults as Config
  middlewares: Middleware = {}
  hooks: Hook = {}

  constructor({
    middlewares,
    hooks,
    server,
    database,
    security,
    rest,
  }: {
    middlewares?: Middleware
    hooks?: Hook
    server?: ServerConfig
    database?: DBConfig
    security?: SecurityConfig
    rest?: any
  } = {}) {
    this.middlewares = middlewares || {}
    this.hooks = hooks || {}
    this.config = loadConfig(this.cwd, {
      server,
      database,
      security,
      rest,
    })
    this.app = fastify({
      logger: this.config.server.logger,
    })

    this.app.server.on('connect', (conn) => {
      console.log('-----connect')
      console.log(conn)
    })
  }

  async init() {
    if (this.config.database.client === 'prisma') {
      const { prepare } = require('./utils/prisma')
      await prepare(this.config, this.cwd)
    }
    this.db = await getDBClient(this.config)

    // load middleware
    await this.applyMiddlewares()
    await this.applyHooks()
  }

  async applyMiddlewares() {
    this.app.register(require('fastify-cookie'))

    if (this.config.security && this.config.security.cors) {
      this.app.register(require('fastify-cors'), this.config.security.cors)
    }

    if (this.config.server.compress) {
      this.app.register(
        require('fastify-compress'),
        typeof this.config.server.compress === 'boolean'
          ? { global: false }
          : this.config.server.compress,
      )
    }

    await registerGraphql(
      this.app,
      this.config.server.graphql,
      this.db,
      this.cwd,
    )

    for (let [key, opts = {}] of Object.entries(this.middlewares)) {
      this.app.register(require(key), opts)
    }
  }

  applyHooks() {
    this.app.addHook(
      'onError',
      (request: any, reply: any, error: any, done: any) => {
        console.log(error)
        // Some code
        done()
      },
    )

    for (let [key, cb] of Object.entries(this.hooks)) {
      this.app.addHook(key as any, cb)
    }
  }

  async start() {
    try {
      await this.init()
      await this.app.ready().then(() => {
        console.log(this.app.printRoutes())
      })
      const { host, port } = this.config.server
      const address = await this.app.listen({
        host,
        port,
      })
      return {
        app: this.app,
        address,
      }
    } catch (err) {
      throw err
    }
  }

  async reload() {
    await this.close()
    await this.start()
  }

  async close() {
    try {
      return this.app.close().then(
        () => {
          console.log('successfully closed!')
        },
        (err) => {
          console.log('an error happened', err)
        },
      )
    } catch (err) {
      throw err
    }
  }
}

export const mrapi = new Mrapi()

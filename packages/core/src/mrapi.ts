import 'reflect-metadata'
import fastify from 'fastify'

import { getDBClient } from './db'
import { loadConfig } from './utils/tools'
import * as defaults from './config/defaults.json'
import registerGraphql from './middlewares/graphql'
import registerRest from './middlewares/rest'
import { App, DBClient, Config, Hooks } from './types'

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})

export class Mrapi {
  app: App
  cwd = process.cwd()
  db: DBClient
  config = defaults as Config
  middlewares = []
  hooks: Hooks = {}

  constructor({
    config,
    middlewares,
    hooks,
  }: {
    config?: Config
    middlewares?: any[]
    hooks?: Hooks
  } = {}) {
    this.middlewares = middlewares || []
    this.hooks = hooks || {}
    this.config = loadConfig(this.cwd, config)
    this.app = fastify({
      logger: this.config.server.logger,
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

    if (this.config.server && this.config.server.cors) {
      this.app.register(require('fastify-cors'), this.config.server.cors)
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

    if (this.config.rest && this.config.rest.enable) {
      if (this.config.rest.documentation) {
        this.app.register(
          require('fastify-oas'),
          this.config.rest.documentation,
        )
      }

      await registerRest(this.app, this.config, this.db, this.cwd)
    }

    for (let [plugin, options = {}] of this.middlewares) {
      if (plugin) {
        this.app.register(plugin, options)
      }
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

        if (
          this.config.rest &&
          this.config.rest.enable &&
          this.config.rest.documentation
        ) {
          this.app.oas()
        }
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

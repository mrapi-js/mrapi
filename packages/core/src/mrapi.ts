import 'reflect-metadata'
import fastify from 'fastify'

import { getDBClient } from './db'
import { loadConfig } from './utils/tools'
import { MrapiOptions, App, DBClient } from './types'

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})

export class Mrapi {
  cwd = process.cwd()
  app: App
  db: DBClient
  callbacksAfterReady: Function[] = []

  constructor(public options?: MrapiOptions) {
    this.options = loadConfig(this.cwd, options)
    this.app = fastify({
      logger: this.options.server.logger,
    })
  }

  async init() {
    if (this.options.database.client === 'prisma') {
      const { prepare } = require('./utils/prisma')
      await prepare(this.options, this.cwd)
    }
    this.db = await getDBClient(this.options)

    // load middleware
    await this.registerPlugins()
    await this.registerHooks()
  }

  async registerPlugins() {
    const plugins = Object.entries(this.options.plugins)

    for (let [key, val] of plugins) {
      if (val && !val.enable) {
        continue
      }
      try {
        if (key.startsWith('builtIn:')) {
          const name = key.split(':')[1]

          let plugin = require(`./plugins/${name}`)
          plugin = plugin.default || plugin
          const ret = await plugin(
            this.app,
            val.options,
            this.db,
            this.cwd,
            this.options,
          )
          this.app.log.debug(`register plugin:`, key)
          if (
            ret &&
            ret.callbackAfterReady &&
            typeof ret.callbackAfterReady === 'function'
          ) {
            this.callbacksAfterReady.push(ret.callbackAfterReady)
          }
        } else {
          const pluginPath = require.resolve(key)
          this.app.register(require(pluginPath), val.options)
          this.app.log.debug(`register plugin:`, key)
        }
      } catch (err) {
        if (err && err.code === 'MODULE_NOT_FOUND') {
          this.app.log.error(`plugin '${key}' not found`)
        } else {
          this.app.log.error(err)
        }
      }
    }
  }

  registerHooks() {
    for (let [key, cb] of Object.entries(this.options.hooks)) {
      this.app.addHook(key as any, cb)
    }
  }

  async start() {
    try {
      await this.init()
      await this.app.ready().then(async () => {
        console.log(this.app.printRoutes())

        for (let fn of this.callbacksAfterReady) {
          await fn()
        }
      })
      const { host, port } = this.options.server
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

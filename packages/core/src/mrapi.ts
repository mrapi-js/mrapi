import ms = require('ms')
import fastify = require('fastify')
import fastifyGQL = require('fastify-gql')
import fastifyCORS = require('fastify-cors')
import fastifyCookie = require('fastify-cookie')
import { formatError, GraphQLError } from 'graphql'

import { getDBClient } from './db'
import { Auth } from './auth'
import * as defaults from './config/defaults.json'
import {
  HttpServer,
  HttpRequest,
  HttpResponse,
  ContextWithPrisma,
  DBClient,
  Request,
  Reply,
  Config,
  Middleware,
  Hook,
} from './types'

import { loadConfig } from './utils/tools'

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})

export class Mrapi {
  app: fastify.FastifyInstance<HttpServer, HttpRequest, HttpResponse>
  db: DBClient
  auth: Auth
  cwd = process.cwd()
  config = defaults as Config
  middlewares: Middleware = {}
  hooks: Hook = {}

  constructor({
    middlewares,
    hooks,
  }: {
    middlewares?: Middleware
    hooks?: Hook
  } = {}) {
    this.middlewares = middlewares || {}
    this.hooks = hooks || {}
    // load configs
    this.config = loadConfig(this.cwd)
    // console.log(this.config)
    this.app = fastify({
      logger: this.config.server.logger,
    })
    this.auth = new Auth(this.config.security.auth)
  }

  async init() {
    if (this.config.database.client === 'prisma') {
      const { prepare } = require('./utils/prisma')
      await prepare(this.config, this.cwd)
    }
    this.db = await getDBClient(this.config)
    // load middleware
    await this.applyMiddleware()
    await this.applyHooks()
  }

  async applyMiddleware() {
    this.app.register(fastifyCORS, this.config.security.cors)
    this.app.register(fastifyCookie)
    if (this.config.server.graphql) {
      const option = this.config.server.graphql
      const { createSchema } = require('./utils/schema')
      const schema = await createSchema(option, this.cwd)
      // console.log({ schema })
      this.app.register(fastifyGQL, {
        schema,
        context: (request: Request, reply: Reply) => {
          return {
            ...this.db.context,
            request,
            reply,
          } as ContextWithPrisma
        },
        path: option.endpoint,
        ide: option.playground,
        // https://github.com/zalando-incubator/graphql-jit
        jit: option.jit,
        // 请求嵌套层级
        queryDepth: option.queryDepth,
        errorHandler(err: any, request: Request, reply: Reply) {
          if (err.data) {
            reply.code(200)
          } else {
            reply.code(err.statusCode || 500)
          }

          let returns

          if (err.errors) {
            const errors = err.errors.map((error: any) => {
              // console.log(error.message.split('\n'))
              return error instanceof GraphQLError
                ? formatError(error)
                : { message: error.message }
            })

            returns = { errors, data: err.data || null }
          } else {
            returns = {
              errors: [{ message: err.message }],
              data: err.data || null,
            }
          }

          reply.send(returns)

          return returns
        },
      })
    }

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

    this.app.addHook('onRequest', async (request: any, reply: any) => {
      const accessToken = request.cookies['access-token']
      const refreshToken = request.cookies['refresh-token']
      console.log('cookies:', request.cookies)
      if (!refreshToken && !accessToken) {
        return
      }
      if (this.auth.verifyAccessToken(accessToken) || !refreshToken) {
        return
      }

      const refreshInfo = this.auth.verifyRefreshToken(refreshToken)
      if (!refreshInfo || !refreshInfo.id) {
        return
      }

      const user = await this.db.client.user.findOne({
        where: {
          id: refreshInfo.id,
        },
        include: {
          role: true,
        },
      })
      // token has been invalidated
      if (!user || user.times !== refreshInfo.times) {
        return
      }
      const tokens = this.auth.createTokens(user)

      const now = Date.now()
      reply.setCookie(this.auth.config.accessTokenName, tokens.accessToken, {
        // domain: 'localhost',
        path: '/',
        // secure: false, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true, // alternative CSRF protection
        expires: new Date(now + ms(this.auth.config.accessTokenExpiresIn)),
      })

      reply.setCookie(this.auth.config.refreshTokenName, tokens.refreshToken, {
        // domain: 'localhost',
        path: '/',
        // secure: false, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true, // alternative CSRF protection
        expires: new Date(now + ms(this.auth.config.refreshTokenExpiresIn)),
      })
      ;(request as Request).user = {
        id: user.id,
        role: user.role,
      }
      return
    })

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
      return this.app.listen({
        host,
        port,
      })
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

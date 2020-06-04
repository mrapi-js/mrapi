/*
  findMany({ where: {}, orderBy: {}, after: {}, before: {}, first: 5, last: 2, skip: 5, })
  findOne({ where: {} })

  create({ data: {} })

  update({ where: {}, data: {} })
  // updateMany({ where: {}, data: {} })

  // upsert({ where: {}, update: {}, create: {} })

  delete({ where: {} })
  // deleteMany({ where: {} })
*/

import pluralize from 'pluralize'

import { App, Request, Reply } from '../types'
import { parseFilter } from '../utils/filters'
import { getModelNames } from '../utils/prisma'
import { getCustomRoutes } from '../utils/routes'
import { FastifyOASOptions } from 'fastify-oas'

type OpenapiOptions = {
  prefix?: string
  custom?: {
    path: string
  }
  schema?: any
  documentation?: {
    enable: boolean
    options: FastifyOASOptions
  }
}

export default async (app: App, config: OpenapiOptions, db, cwd, options) => {
  // documentation
  if (config.documentation?.enable) {
    app.register(require('fastify-oas'), config.documentation.options)
  }

  const names = await getModelNames(options)
  const userConfig = config.schema
  // check user config
  if (userConfig) {
    for (let m of Object.keys(userConfig)) {
      if (!names.includes(m)) {
        app.log.warn(`model '${m}' not found`)
      }
    }
  }

  const models: { model: string; api: string; methods: string[] }[] = []
  for (let name of names) {
    if (userConfig && !userConfig[name]) {
      continue
    }
    const model = name.charAt(0).toLowerCase() + name.slice(1)
    models.push({
      model,
      api: pluralize(model),
      methods:
        userConfig && userConfig[name]
          ? userConfig[name]
          : ['findOne', 'findMany', 'create', 'update', 'delete'],
    })
  }
  let prefix = config.prefix || '/'
  prefix = prefix.startsWith('/') ? prefix : `/${prefix}`

  // core APIs
  if (models && models.length > 0) {
    app.register(coreAPIs(models, db), {
      prefix,
    })
  }

  // custom APIs
  const routes = await getCustomRoutes(config, cwd)
  if (routes && routes.length > 0) {
    app.register(customAPIs(routes, db), {
      prefix,
    })
  }

  if (config.documentation?.enable) {
    return {
      callbackAfterReady: app.oas,
    }
  }
}

// TODO: route schema
function coreAPIs(models, db) {
  return (app, opts, done) => {
    for (let { model, api, methods } of models) {
      if (methods.includes('findMany')) {
        app.route({
          method: 'GET',
          url: `/${api}`,
          schema: {
            querystring: {
              select: { type: 'string' },
              include: { type: 'string' },
              orderBy: { type: 'string' },
            },
          },
          async handler(request: Request, reply: Reply) {
            try {
              const params = parseFilter(request.query, {
                filtering: true,
                pagination: true,
                sorting: true,
                selecting: true,
              })
              reply.send({
                code: 0,
                data: {
                  list: await db[model].findMany(params),
                  total: await db[model].count({
                    where: params.where || {},
                  }),
                },
              })
            } catch (err) {
              reply.send({
                code: -1,
                message: err.message,
              })
            }
          },
        })
      }
      if (methods.includes('findOne')) {
        app.get(`/${api}/:id`, async (request: Request) => {
          try {
            return {
              code: 0,
              data: await db[model].findOne({
                where: request.params,
                ...parseFilter(request.query, {
                  selecting: true,
                }),
              }),
            }
          } catch (err) {
            return {
              code: -1,
              message: err.message,
            }
          }
        })
      }
      if (methods.includes('create')) {
        app.post(`/${api}`, async (request: Request) => {
          try {
            return {
              code: 0,
              data: await db[model].create({
                data: request.body,
                ...parseFilter(request.query, {
                  selecting: true,
                }),
              }),
            }
          } catch (err) {
            return {
              code: -1,
              message: err.message,
            }
          }
        })
      }
      if (methods.includes('update')) {
        app.put(`/${api}/:id`, async (request: Request) => {
          try {
            return {
              code: 0,
              data: await db[model].update({
                where: request.params,
                data: request.body,
                ...parseFilter(request.query, {
                  selecting: true,
                }),
              }),
            }
          } catch (err) {
            return {
              code: -1,
              message: err.message,
            }
          }
        })
      }
      if (methods.includes('delete')) {
        app.delete(`/${api}/:id`, async (request: Request) => {
          try {
            return {
              code: 0,
              data: await db[model].delete({
                where: request.params,
                ...parseFilter(request.query, {
                  selecting: true,
                }),
              }),
            }
          } catch (err) {
            return {
              code: -1,
              message: err.message,
            }
          }
        })
      }
    }
    done()
  }
}

function customAPIs(routes, db) {
  return (app: App, opts, done) => {
    for (let route of routes) {
      app.route({
        ...route,
        handler: (request: Request, reply: Reply) =>
          route.handler({ app, request, reply, prisma: db }),
      })
    }
    done()
  }
}

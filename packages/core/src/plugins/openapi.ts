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

import { FastifyOASOptions } from 'fastify-oas'
import { MultiTenant } from '@mrapi/multi-tenant'

import { getDBClient } from '../db'
import { getModels } from '../utils/prisma'
import { parseFilter } from '../utils/filters'
import { getCustomRoutes } from '../utils/routes'
import { App, Request, Reply, MrapiOptions, PrismaClient } from '../types'

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

export default async (
  app: App,
  config: OpenapiOptions,
  {
    prismaClient,
    multiTenant,
  }: { prismaClient: PrismaClient; multiTenant: MultiTenant<PrismaClient> },
  cwd = process.cwd(),
  options: MrapiOptions,
) => {
  // documentation
  if (config.documentation?.enable) {
    app.register(require('fastify-oas'), config.documentation.options)
  }
  const models = await getModels(config.schema)
  let prefix = config.prefix || '/'
  prefix = prefix.startsWith('/') ? prefix : `/${prefix}`

  // core APIs
  const coreRoutes = generateCoreRoutes({
    models,
    prismaClient,
    multiTenant,
    options,
  })
  if (coreRoutes && coreRoutes.length > 0) {
    app.register(coreAPIs(coreRoutes), {
      prefix,
    })
  }

  // custom APIs
  const customRoutes = await getCustomRoutes(config, cwd)
  if (customRoutes && customRoutes.length > 0) {
    app.register(
      customAPIs({ routes: customRoutes, prismaClient, multiTenant, options }),
      {
        prefix,
      },
    )
  }

  if (config.documentation?.enable) {
    return {
      callbackAfterReady: app.oas,
    }
  }

  return null
}

function coreAPIs(routes: any[]) {
  return (app: App, opts: any, done: () => void) => {
    for (let route of routes) {
      app.route(route)
    }
    done()
  }
}

function customAPIs({
  routes,
  prismaClient,
  multiTenant,
  options,
}: {
  routes: any[]
  prismaClient: PrismaClient
  multiTenant: MultiTenant<PrismaClient>
  options: any
}) {
  return (app: App, opts: any, done: () => void) => {
    for (let route of routes) {
      app.route({
        ...route,
        handler: async (request: Request, reply: Reply) => {
          const client = await getDBClient({
            prismaClient,
            multiTenant,
            options,
            request,
            reply,
          })

          return route.handler({ app, request, reply, prisma: client })
        },
      })
    }
    done()
  }
}

function generateCoreRoutes({
  models,
  prismaClient,
  multiTenant,
  options,
}: any) {
  let routes = []

  for (let { name, api, methods, fields, documentation } of models) {
    const modelName = name.charAt(0).toLowerCase() + name.slice(1)
    const scalarFields = fields
      .filter((f: any) => f.kind === 'scalar')
      .map((f: any) => f.name)
    const relationFields = fields
      .filter((f: any) => f.kind === 'object')
      .map((f: any) => f.name)
    const queryParams = {
      select: {
        type: 'string',
        description: `selecting fields by semicolon interval (fields: ${scalarFields})\nPlease either use 'include' or 'select', but not both at the same time.`,
      },
      include: {
        type: 'string',
        description: `include relation fields by semicolon interval (fields: ${relationFields})\nPlease either use 'include' or 'select', but not both at the same time.`,
      },
    }

    const id = findInArray(fields, 'name', 'id')
    if (!id) {
      throw new Error(`table '${modelName}' should have 'id' field`)
    }

    const idObject = {
      type: id.type === 'String' ? 'string' : 'integer',
      description: id.documentation,
    }

    for (let method of methods) {
      switch (method) {
        case 'findMany': {
          routes.push({
            method: 'GET',
            url: `/${api}`,
            schema: {
              tags: [name],
              summary: documentation ? `${documentation}List` : '',
              query: {
                ...queryParams,
                orderBy: {
                  type: 'string',
                  description: `order by (fields: ${scalarFields})`,
                },
                skip: {
                  type: 'integer',
                  description: `pageSize * pageIndex`,
                },
                first: {
                  type: 'integer',
                  description: `pageSize`,
                },
              },
              type: 'object',
              additionalProperties: true,
            },
            async handler(request: Request, reply: Reply) {
              try {
                const client = await getDBClient({
                  prismaClient,
                  multiTenant,
                  options,
                  request,
                  reply,
                })

                const params = parseFilter(request.query, {
                  filtering: true,
                  pagination: true,
                  sorting: true,
                  selecting: true,
                })
                return {
                  code: 0,
                  data: {
                    list: await client[modelName].findMany(params),
                    total: await client[modelName].count({
                      where: params.where || {},
                    }),
                  },
                }
              } catch (err) {
                return {
                  code: -1,
                  message: err.message,
                }
              }
            },
          })
          break
        }
        case 'findOne': {
          routes.push({
            method: 'GET',
            url: `/${api}/:id`,
            schema: {
              tags: [name],
              summary: documentation ? `${documentation}Object` : '',
              params: {
                type: 'object',
                properties: {
                  id: idObject,
                },
              },
              query: queryParams,
            },
            async handler(request: Request, reply: Reply) {
              try {
                const client = await getDBClient({
                  prismaClient,
                  multiTenant,
                  options,
                  request,
                  reply,
                })

                return {
                  code: 0,
                  data: await client[modelName].findOne({
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
            },
          })
          break
        }
        case 'create': {
          routes.push({
            method: 'POST',
            url: `/${api}`,
            schema: {
              tags: [name],
              summary: documentation ? `${documentation}Create` : '',
              body: {
                type: 'object',
                description: 'user object',
                // examples: [
                //   {
                //     name: 'Object Sample',
                //     summary: 'an example',
                //     value: { a: 'payload' },
                //   },
                // ],
                properties: {
                  a: { type: 'string', description: 'your payload' },
                },
              },
            },
            async handler(request: Request, reply: Reply) {
              try {
                const client = await getDBClient({
                  prismaClient,
                  multiTenant,
                  options,
                  request,
                  reply,
                })

                return {
                  code: 0,
                  data: await client[modelName].create({
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
            },
          })
          break
        }
        case 'update': {
          routes.push({
            method: 'PUT',
            url: `/${api}/:id`,
            schema: {
              tags: [name],
              summary: documentation ? `${documentation}Update` : '',
              params: {
                type: 'object',
                properties: {
                  id: idObject,
                },
              },
            },
            async handler(request: Request, reply: Reply) {
              try {
                const client = await getDBClient({
                  prismaClient,
                  multiTenant,
                  options,
                  request,
                  reply,
                })

                return {
                  code: 0,
                  data: await client[modelName].update({
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
            },
          })
          break
        }
        case 'delete': {
          routes.push({
            method: 'DELETE',
            url: `/${api}/:id`,
            schema: {
              tags: [name],
              summary: documentation ? `${documentation}Delete` : '',
              params: {
                type: 'object',
                properties: {
                  id: idObject,
                },
              },
            },
            async handler(request: Request, reply: Reply) {
              try {
                const client = await getDBClient({
                  prismaClient,
                  multiTenant,
                  options,
                  request,
                  reply,
                })

                return {
                  code: 0,
                  data: await client[modelName].delete({
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
            },
          })
          break
        }
        default:
          break
      }
    }
  }

  return routes
}

function findInArray(arr: any[], keyName: string, key: string) {
  return arr.find((a: Record<string, any>) => a[keyName] === key)
}

import { findManyFilter } from './filters'

function getModels(dmmf: any) {
  let models = JSON.parse(JSON.stringify(dmmf.datamodel.models))
  const mappings = JSON.parse(JSON.stringify(dmmf.mappings))
  models = models
    .map((model: any) => {
      const mapping = mappings.find((m: any) => m.model === model.name)
      if (mapping) {
        return {
          ...model,
          api: mapping.plural,
          methods: Object.keys(mapping)
            .map((key) => (['model', 'plural'].includes(key) ? null : key))
            .filter(Boolean),
        }
      }
      return null
    })
    .filter(Boolean)

  return models
}

function findInArray(arr: any[], keyName: string, key: string) {
  return arr.find((a: Record<string, any>) => a[keyName] === key)
}

export default function GraphQLToOpenAPIConverter(
  name: string,
  dmmf: any,
  getPrisma: (req: any) => Promise<any>,
) {
  const models = getModels(dmmf)

  console.log('models:', models)

  const routes = []

  for (const { name, api, methods, fields, documentation } of models) {
    const modelName = `${name.charAt(0).toLowerCase()}${name.slice(1)}`
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

    // const idObject = {
    //   type: id.type === 'String' ? 'string' : 'integer',
    //   description: id.documentation,
    // }

    for (const method of methods) {
      switch (method) {
        // http://0.0.0.0:1358/api/one/users?orderBy=name:asc&skip=0&take=2
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
                  description: 'pageSize * pageIndex',
                },
                first: {
                  type: 'integer',
                  description: 'pageSize',
                },
              },
              type: 'object',
              additionalProperties: true,
            },
            async handler(res: any) {
              const prisma = await getPrisma(res)
              const listParams = findManyFilter(res.query)
              const [list, total] = await Promise.all([
                prisma[modelName].findMany(listParams),
                prisma[modelName].count({
                  where: listParams.where,
                }),
              ])
              return {
                list,
                total,
              }
            },
          })
          break
        }
        // case 'findOne': {
        //   routes.push({
        //     method: 'GET',
        //     url: `/${api}/:id`,
        //     schema: {
        //       tags: [name],
        //       summary: documentation ? `${documentation}Object` : '',
        //       params: {
        //         type: 'object',
        //         properties: {
        //           id: idObject,
        //         },
        //       },
        //       query: queryParams,
        //     },
        //     async handler(request: Request, reply: Reply) {
        //       try {
        //         const client = await getDBClient({
        //           prismaClient,
        //           multiTenant,
        //           options,
        //           request,
        //           reply,
        //         })

        //         return {
        //           code: 0,
        //           data: await client[modelName].findOne({
        //             where: request.params,
        //             ...parseFilter(request.query, {
        //               selecting: true,
        //             }),
        //           }),
        //         }
        //       } catch (err) {
        //         return {
        //           code: -1,
        //           message: err.message,
        //         }
        //       }
        //     },
        //   })
        //   break
        // }
        // case 'create': {
        //   routes.push({
        //     method: 'POST',
        //     url: `/${api}`,
        //     schema: {
        //       tags: [name],
        //       summary: documentation ? `${documentation}Create` : '',
        //       body: {
        //         type: 'object',
        //         description: 'user object',
        //         properties: {
        //           a: { type: 'string', description: 'your payload' },
        //         },
        //       },
        //     },
        //     async handler(request: Request, reply: Reply) {
        //       try {
        //         const client = await getDBClient({
        //           prismaClient,
        //           multiTenant,
        //           options,
        //           request,
        //           reply,
        //         })

        //         return {
        //           code: 0,
        //           data: await client[modelName].create({
        //             data: request.body,
        //             ...parseFilter(request.query, {
        //               selecting: true,
        //             }),
        //           }),
        //         }
        //       } catch (err) {
        //         return {
        //           code: -1,
        //           message: err.message,
        //         }
        //       }
        //     },
        //   })
        //   break
        // }
        // case 'update': {
        //   routes.push({
        //     method: 'PUT',
        //     url: `/${api}/:id`,
        //     schema: {
        //       tags: [name],
        //       summary: documentation ? `${documentation}Update` : '',
        //       params: {
        //         type: 'object',
        //         properties: {
        //           id: idObject,
        //         },
        //       },
        //     },
        //     async handler(request: Request, reply: Reply) {
        //       try {
        //         const client = await getDBClient({
        //           prismaClient,
        //           multiTenant,
        //           options,
        //           request,
        //           reply,
        //         })

        //         return {
        //           code: 0,
        //           data: await client[modelName].update({
        //             where: request.params,
        //             data: request.body,
        //             ...parseFilter(request.query, {
        //               selecting: true,
        //             }),
        //           }),
        //         }
        //       } catch (err) {
        //         return {
        //           code: -1,
        //           message: err.message,
        //         }
        //       }
        //     },
        //   })
        //   break
        // }
        // case 'delete': {
        //   routes.push({
        //     method: 'DELETE',
        //     url: `/${api}/:id`,
        //     schema: {
        //       tags: [name],
        //       summary: documentation ? `${documentation}Delete` : '',
        //       params: {
        //         type: 'object',
        //         properties: {
        //           id: idObject,
        //         },
        //       },
        //     },
        //     async handler(request: Request, reply: Reply) {
        //       try {
        //         const client = await getDBClient({
        //           prismaClient,
        //           multiTenant,
        //           options,
        //           request,
        //           reply,
        //         })

        //         return {
        //           code: 0,
        //           data: await client[modelName].delete({
        //             where: request.params,
        //             ...parseFilter(request.query, {
        //               selecting: true,
        //             }),
        //           }),
        //         }
        //       } catch (err) {
        //         return {
        //           code: -1,
        //           message: err.message,
        //         }
        //       }
        //     },
        //   })
        //   break
        // }
        default:
          break
      }
    }
  }

  return routes
}

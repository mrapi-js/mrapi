/*
  findMany({ where: {}, orderBy: {}, after: {}, before: {}, first: 5, last: 2, skip: 5, })
  findOne({ where: {} })

  create({ data: {} })

  update({ where: {}, data: {} })
  // updateMany({ where: {}, data: {} })

  upsert({ where: {}, update: {}, create: {} })

  delete({ where: {} })
  // deleteMany({ where: {} })
*/

import pluralize from 'pluralize'

import { App, Request, Config } from '../types'
import { parseFilter } from '../utils/filters'
import { getModels } from '../utils/prisma'

export default async (app: App, config: Config, db, cwd) => {
  const names = await getModels(config)
  const userConfig = config.rest.schema
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
  let prefix = config.rest.prefix || '/'
  prefix = prefix.startsWith('/') ? prefix : `/${prefix}`

  app.register(handler(models, db), {
    prefix,
  })
}

function handler(models, db) {
  return (app, opts, done) => {
    for (let { model, api, methods } of models) {
      if (methods.includes('findMany')) {
        app.get(`/${api}`, async (request: Request) => {
          const params = parseFilter(request.query)
          return db[model].findMany(params)
        })
      }

      if (methods.includes('findOne')) {
        app.get(`/${api}/:id`, async (request: Request) => {
          return db[model].findOne({
            where: request.params,
          })
        })
      }
      if (methods.includes('create')) {
        app.post(`/${api}`, async (request: Request) => {
          return db[model].create({
            data: request.body,
          })
        })
      }
      if (methods.includes('update')) {
        app.put(`/${api}/:id`, async (request: Request) => {
          return db[model].update({
            where: request.params,
            data: request.body,
          })
        })
      }
      if (methods.includes('delete')) {
        app.delete(`/${api}/:id`, async (request: Request) => {
          return db[model].delete({
            where: request.params,
          })
        })
      }
    }
    done()
  }
}

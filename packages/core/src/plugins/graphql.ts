import { Request, Reply } from '../types'
import { createSchema } from '../utils/schema'

export default async (app, option, db, cwd) => {
  const schema = await createSchema(option, cwd)

  const options = option
  delete options.buildSchema

  // https://github.com/mcollina/fastify-gql#plugin-options
  app.register(require('fastify-gql'), {
    errorHandler(err, request, reply) {},
    ...options,
    schema,
    context: (request: Request, reply: Reply) => {
      return {
        request,
        reply,
        prisma: db,
        app: app,
      }
    },
  })
}

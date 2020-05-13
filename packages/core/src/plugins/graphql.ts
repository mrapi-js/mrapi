import { formatError, GraphQLError } from 'graphql'

import { Request, Reply } from '../types'
import { createSchema } from '../utils/schema'

export default async (app, option, db, cwd) => {
  const schema = await createSchema(option, cwd)

  app.register(require('fastify-gql'), {
    schema,
    context: (request: Request, reply: Reply) => {
      return {
        request,
        reply,
        prisma: db,
        app: app,
      }
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

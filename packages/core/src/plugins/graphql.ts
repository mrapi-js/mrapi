import { formatError, GraphQLError } from 'graphql'

import { Request, Reply, MrapiOptions } from '../types'
import { createSchema } from '../utils/schema'
import { getModels } from '../utils/prisma'

export default async (app, config, db, cwd, options: MrapiOptions) => {
  const models = await getModels(config.schema)
  const modelNames = models.map((m) => m.name)
  const schema = await createSchema(config, cwd, modelNames)
  delete config.buildSchema

  // disable GraphQL Introspection
  if (config.noIntrospection) {
    app.addHook('preValidation', (request, reply, done) => {
      const queryString =
        // POST
        request.body && request.body.query
          ? request.body.query
          : // GET
          request.query && request.query.query
          ? request.query.query
          : null
      if (queryString) {
        const message = checkIntrospectionQuery(queryString)
        if (message) {
          done(message)
        }
      }
      done()
    })
  }

  // https://github.com/mcollina/fastify-gql#plugin-options
  app.register(require('fastify-gql'), {
    errorHandler(err: any, request: Request, reply: Reply) {
      let returns
      if (err.errors) {
        const errors = err.errors.map((error: any) => {
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

      if (!reply.sent) {
        reply.send(returns)
      } else {
        return returns
      }
    },
    ...config,
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

// https://graphql.org/learn/introspection/
function checkIntrospectionQuery(queryString: string) {
  if (!queryString) {
    return null
  }
  const strArr = [
    '__schema',
    '__TypeKind',
    '__Field',
    '__InputValue',
    '__EnumValue',
    '__Directive',
  ]

  if (strArr.find((str) => queryString.includes(str))) {
    return {
      errors: [
        {
          message: 'GraphQL introspection is not allowed',
        },
      ],
      data: null,
    }
  }
  return null
}

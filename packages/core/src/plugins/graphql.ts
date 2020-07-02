import { formatError, GraphQLError } from 'graphql'

import { getDBClient } from '../db'
import { getModels } from '../utils/prisma'
import { createSchema } from '../utils/schema'
import {
  App,
  Request,
  Reply,
  MrapiOptions,
  PrismaClient,
  MultiTenant,
} from '../types'

export default async (
  app: App,
  config: any,
  {
    prismaClient,
    multiTenant,
  }: { prismaClient: PrismaClient; multiTenant: MultiTenant<PrismaClient> },
  cwd = process.cwd(),
  options: MrapiOptions,
) => {
  const models = await getModels(config.schema)
  const modelNames = models.map((m: Record<string, any>) => m.name)
  const schema = await createSchema(config, cwd, modelNames)
  delete config.buildSchema

  // disable GraphQL Introspection
  if (config.noIntrospection) {
    app.addHook(
      'preValidation',
      (request: Request, reply: Reply, done: (err?: Error) => void) => {
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
            done(new Error(message))
          }
        }
        done()
      },
    )
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
        return null
      }
      return returns
    },
    ...config,
    schema,
    context: async (request: Request, reply: Reply) => {
      // graphql playground
      const isIntrospectionQuery =
        request.body.operationName === 'IntrospectionQuery'
      const client = isIntrospectionQuery
        ? null
        : await getDBClient({
            prismaClient,
            multiTenant,
            options,
            request,
            reply,
          })

      return {
        request,
        reply,
        prisma: client,
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
    return 'GraphQL introspection is not allowed'
  }
  return null
}

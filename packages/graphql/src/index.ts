import type { Request, Response } from '@mrapi/app'
import type { CacheValue, ErrorCacheValue, Options } from './types'

import LRU from 'tiny-lru'
import { CompiledQuery, compileQuery } from 'graphql-jit'
import { parse, validate, validateSchema } from 'graphql'

// function isEnumerableObject(value: any) {
//   return typeof value === 'object' && value !== null && !Array.isArray(value)
// }

export * from './types'

export const graphqlMiddleware = ({
  schema,
  context,
  formatError,
}: Options) => {
  const lru = LRU<CacheValue>(1024)
  const lruErrors = LRU<ErrorCacheValue>(1024)

  const schemaValidationErrors = validateSchema(schema)
  if (schemaValidationErrors.length > 0) {
    throw schemaValidationErrors
  }

  return async (req: Request, res: Response) => {
    // GraphQL HTTP only supports GET and POST methods.
    if (!['GET', 'POST'].includes(req.method)) {
      return res
        .status(405)
        .send('GraphQL only supports GET and POST requests.')
    }

    // // adapted from https://github.com/jaydenseric/graphql-api-koa/blob/master/lib/execute.js#L105
    // if (typeof req.body === 'undefined') {
    //   return res.status(400).send('Request body missing.')
    // }

    // if (!isEnumerableObject(req.body)) {
    //   return res.status(400).send('Request body must be a JSON object.')
    // }

    // if (!('query' in req.body)) {
    //   return res.status(400).send('GraphQL operation field `query` missing.')
    // }

    // if ('variables' in req.body && !isEnumerableObject(req.body.variables)) {
    //   return res
    //     .status(400)
    //     .send('Request body JSON `variables` field must be an object.')
    // }

    // if (
    //   typeof req.body.operationName !== 'string' &&
    //   typeof req.body.operationName !== 'undefined' &&
    //   req.body.operationName !== null
    // ) {
    //   return res
    //     .status(400)
    //     .send(
    //       'Request body JSON `operationName` field must be an string/null/undefined.',
    //     )
    // }
    const query = req.body.query || req.query.query

    // const { query } = req.body

    // adapted from https://github.com/mcollina/fastify-gql/blob/master/index.js#L206
    let cached = lru.get(query)
    let document = null

    if (!cached) {
      // We use two caches to avoid errors bust the good
      // cache. This is a protection against DoS attacks
      const cachedError = lruErrors.get(query)

      if (cachedError) {
        return res.status(400).send(cachedError.validationErrors)
      }

      try {
        document = parse(query)
      } catch (error) {
        return res
          .status(400)
          .send(`GraphQL query syntax error: ${error.message}`)
      }

      const validationErrors = validate(schema, document)

      if (validationErrors.length > 0) {
        lruErrors.set(query, { document, validationErrors })
        return res.status(400).send({
          errors: validationErrors,
        })
      }

      cached = {
        document,
        validationErrors,
        jit: compileQuery(
          schema,
          document,
          req.body.operationName,
        ) as CompiledQuery,
      }

      lru.set(query, cached)
    }

    const result = await cached.jit.query(
      {},
      context ? await context({ req, res }) : {},
      req.body.variables,
    )

    if (result.errors && formatError) {
      result.errors = result.errors.map((error) =>
        formatError({ req, res, error }),
      )
    }

    return res.json(result)
  }
}

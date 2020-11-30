import type { app } from '@mrapi/app'
import type { DocumentNode, ExecutionResult } from 'graphql'
import type { CompiledQuery } from 'graphql-jit'
import type { CacheValue, ErrorCacheValue, Options } from './types'

import LRU from 'tiny-lru'
import { validateQuery } from './validate'
import { getRequestParams } from './param'
import { compileQuery,isCompiledQuery } from 'graphql-jit'
import { defaultErrorFormatter } from './error'
import { parse, validateSchema,execute } from 'graphql'

export * as graphql from './types'

export const graphqlMiddleware = ({
  schema,
  context,
  errorFormatter,
  extensions,
  queryDepth,
  introspection,
}: Options) => {
  const lru = LRU<CacheValue>(1024)
  const lruErrors = LRU<ErrorCacheValue>(1024)

  const schemaValidationErrors = validateSchema(schema)
  if (schemaValidationErrors.length > 0) {
    throw schemaValidationErrors
  }

  const errorFormatterFn =
    typeof errorFormatter === 'function'
      ? errorFormatter
      : defaultErrorFormatter

  return async (req: app.Request, res: app.Response) => {
    // GraphQL HTTP only supports GET and POST methods.
    if (!['GET', 'POST'].includes(req.method)) {
      return res
        .status(405)
        .send('GraphQL only supports GET and POST requests.')
    }

    const { query, variables, operationName } = getRequestParams(req)

    if (!query) {
      return res.status(400).send(`Invalid GraphQL query`)
    }

    // adapted from https://github.com/mcollina/fastify-gql/blob/master/index.js#L206
    let cached = lru.get(query)
    let document: DocumentNode

    if (!cached) {
      // We use two caches to avoid errors bust the good
      // cache. This is a protection against DoS attacks
      const cachedError = lruErrors.get(query)

      if (cachedError) {
        return res.status(400).json({
          errors: cachedError.errors,
        })
      }

      try {
        document = parse(query)
      } catch (error) {
        return res
          .status(400)
          .send(`GraphQL query syntax error: ${error.message}`)
      }

      const errors = validateQuery({
        schema,
        document,
        introspection,
        queryDepth,
      })

      if (Array.isArray(errors) && errors.length > 0) {
        lruErrors.set(query, { document, errors })

        return res.status(400).json({
          errors,
        })
      }
      const compiledQuery = compileQuery(schema, document);
      // check if the compilation is successful
      if (isCompiledQuery(compiledQuery)) {
        cached = {
          document,
          errors,
          jit: compiledQuery as CompiledQuery,
        }

        if (lru) {
          lru.set(query, cached)
        }
      }else{
        // 否则不可用 compiledQuery.query
        lru.set(query, {document,errors,jit:false})
      }
    
    
    }

    let result: ExecutionResult = {}
    let contextObj = {}

    try {
      contextObj =
        typeof context === 'function' ? await context({ req, res }) : context
      if(cached?.jit){
        result = await cached.jit.query({}, contextObj, variables)
      }else{
        result = await execute(
          schema,
          parse(query),
          {},
          contextObj,
          variables,
          operationName
        )
      }
      if (result?.errors) {
        result.errors = result.errors.map((error) =>
          errorFormatterFn({ req, res, error }),
        )
      }
    } catch (error) {
      result.errors = [errorFormatterFn({ req, res, error })]
    }

    if (typeof extensions === 'function') {
      const extensionsObject = await extensions({
        req,
        query,
        operationName,
        variables,
        result,
        context: contextObj,
      })
      if (extensionsObject != null) {
        result = { ...result, extensions: extensionsObject }
      }
    }

    return res.json(result)
  }
}

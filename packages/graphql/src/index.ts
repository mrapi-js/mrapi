import type { app } from '@mrapi/app'
import {
  DocumentNode,
  ExecutionResult,
  GraphQLSchema,
  __Field,
  parse,
  validateSchema,
  execute,
  typeFromAST,
  OperationDefinitionNode,
} from 'graphql'
import type { CacheValue, ErrorCacheValue, Options } from './types'

import LRU from 'tiny-lru'
import { validateQuery } from './validate'
import { getRequestParams } from './param'
import { compileQuery, isCompiledQuery } from 'graphql-jit'
import { defaultErrorFormatter } from './error'

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
      return res.status(400).send('Invalid GraphQL query')
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
      if (checkCircularDependencies(schema, parse(query), operationName)) {
        // 这里加是否循环依赖判断，如果是循环依赖直接使用 execute
        lru.set(query, { document, errors, jit: false })
      } else {
        const compiledQuery = compileQuery(schema, document)
        // check if the compilation is successful
        if (isCompiledQuery(compiledQuery)) {
          cached = {
            document,
            errors,
            jit: compiledQuery,
          }

          if (lru) {
            lru.set(query, cached)
          }
        } else {
          // 否则不可用 compiledQuery.query
          lru.set(query, { document, errors, jit: false })
        }
      }
    }

    let result: ExecutionResult = {}
    let contextObj = {}

    try {
      contextObj =
        typeof context === 'function' ? await context({ req, res }) : context
      if (cached?.jit) {
        result = await cached.jit.query({}, contextObj, variables)
      } else {
        result = await execute(
          schema,
          parse(query),
          {},
          contextObj,
          variables,
          operationName,
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

// 循环依赖检查
function checkCircularDependencies(
  schema: GraphQLSchema,
  document: DocumentNode,
  operationName: String,
) {
  let operation: OperationDefinitionNode
  for (const definition of document.definitions) {
    switch (definition.kind) {
      case 'OperationDefinition':
        if (
          !operationName ||
          (definition.name && definition.name.value === operationName)
        ) {
          operation = definition
        }
        break
    }
  }
  let dependencies: Boolean = false
  // @ts-expect-error
  for (const variableDefinition of operation.variableDefinitions) {
    const varType = typeFromAST(schema, variableDefinition.type as any)
    if (varType?.constructor.name === 'GraphQLInputObjectType') {
      // @ts-expect-error
      dependencies = isDependencies(varType?.name, varType?.getFields())
      if (dependencies) {
        return true
      }
    }
  }
  return false
}

function isDependencies(
  name: String | undefined,
  varType: any,
  subname: String | undefined,
): Boolean {
  if (subname && name === subname) {
    return true
  }
  for (var temp of Object.values(varType)) {
    // @ts-expect-errorF
    if (temp?.type?.ofType) {
      return isDependencies(
        name,
        // @ts-expect-error
        temp?.type?.ofType?.ofType.getFields(),
        // @ts-expect-error
        temp?.type?.ofType?.ofType.name,
      )
    }
  }
  return false
}

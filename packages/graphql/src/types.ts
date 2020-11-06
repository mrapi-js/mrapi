import type { Request, Response } from '@mrapi/app'
import type { CompiledQuery } from 'graphql-jit'
import type { DocumentNode, GraphQLError, GraphQLSchema } from 'graphql'

export interface Context {
  req: Request
  res: Response
}

export interface ErrorContext extends Context {
  error: GraphQLError
}

export interface Options {
  schema: GraphQLSchema
  context?: (x: Context) => any
  formatError?: (x: ErrorContext) => GraphQLError
}

export interface ErrorCacheValue {
  document: DocumentNode
  validationErrors: readonly GraphQLError[]
}

export interface CacheValue extends ErrorCacheValue {
  jit: CompiledQuery
}

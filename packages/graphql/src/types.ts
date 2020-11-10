import type { app } from '@mrapi/app'
import type { CompiledQuery } from 'graphql-jit'
import type { DocumentNode, GraphQLError, GraphQLSchema } from 'graphql'

export interface ContextParams {
  req: app.Request
  res: app.Response
}

export interface ErrorContext extends ContextParams {
  error: GraphQLError
}

export interface Options {
  schema: GraphQLSchema
  context?: (x: ContextParams) => any
  formatError?: (x: ErrorContext) => GraphQLError
}

export interface ErrorCacheValue {
  document: DocumentNode
  validationErrors: readonly GraphQLError[]
}

export interface CacheValue extends ErrorCacheValue {
  jit: CompiledQuery
}

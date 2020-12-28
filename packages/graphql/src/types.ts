import type { app } from '@mrapi/app'
import type { CompiledQuery } from 'graphql-jit'
import type {
  DefinitionNode,
  DocumentNode,
  ExecutionResult,
  GraphQLError,
  GraphQLSchema,
} from 'graphql'

export interface ContextParams {
  req: app.Request
  res: app.Response
}

export interface ErrorContext extends ContextParams {
  error: any
}

export interface ExtensionsParams {
  req: app.Request
  query: string
  operationName: string
  variables: { [key: string]: unknown }
  result: ExecutionResult
  context: { [key: string]: any }
}

export interface Options {
  schema: GraphQLSchema
  context?: (x: ContextParams) => any
  errorFormatter?: (x: ErrorContext) => GraphQLError
  extensions?: (
    params: ExtensionsParams,
  ) => Promise<{ [key: string]: unknown }> | { [key: string]: unknown }
  queryDepth?: number
  introspection?: boolean
}

export interface ErrorCacheValue {
  document: DocumentNode
  errors?: readonly GraphQLError[]
}

export interface CacheValue extends ErrorCacheValue {
  jit: CompiledQuery | false
}

export interface ValidateQueryParams
  extends Pick<Options, 'queryDepth' | 'introspection'> {
  schema: GraphQLSchema
  document: DocumentNode
}

export interface OperationsMap {
  [key: string]: DefinitionNode
}

import type { ErrorContext } from './types'

import { GraphQLError } from 'graphql'

export const defaultErrorFormatter = ({
  error,
}: ErrorContext): GraphQLError => {
  return error instanceof GraphQLError ? error : toGraphQLError(error)
}

function toGraphQLError(err: any) {
  return Object.create(GraphQLError, {
    name: {
      value: err.name,
    },
    message: {
      value: err.message,
      enumerable: true,
      writable: true,
    },
    locations: {
      value: err.locations || undefined,
      enumerable: true,
    },
    path: {
      value: err.path || undefined,
      enumerable: true,
    },
    nodes: {
      value: err.nodes || undefined,
    },
    source: {
      value: err.source || undefined,
    },
    positions: {
      value: err.positions || undefined,
    },
    originalError: {
      value: err.originalError || undefined,
    },
    extensions: {
      value: err.extensions || undefined,
    },
  })
}

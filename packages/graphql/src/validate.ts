import type { DefinitionNode, GraphQLError } from 'graphql'
import type { OperationsMap, ValidateQueryParams } from './types'

import { validate } from 'graphql'
import { toGraphQLError } from './error'
import { getOperationsMap } from './utils'

export function validateQuery({
  schema,
  document,
  introspection,
  queryDepth,
}: ValidateQueryParams): readonly GraphQLError[] {
  // basic validation
  const basicErrors = validate(schema, document)
  if (Array.isArray(basicErrors) && basicErrors.length > 0) {
    return basicErrors
  }

  // depth validation
  const map = getOperationsMap(document.definitions)

  const depthErrors = validateQueryDepth({ map, queryDepthLimit: queryDepth })
  if (Array.isArray(depthErrors) && depthErrors.length > 0) {
    return depthErrors
  }

  // custom validation
  if (
    typeof introspection === 'boolean' &&
    introspection === false &&
    Object.keys(map).includes('IntrospectionQuery')
  ) {
    return [
      toGraphQLError({
        message: 'IntrospectionQuery is disabled',
      }),
    ]
  }

  return []
}

/**
 * Returns the depth of nodes in a graphql query
 * Based on https://github.com/mercurius-js/mercurius/blob/master/lib/queryDepth.js
 * Copyright (c) 2018-2020 Matteo Collina and contributors
 * License (MIT License) https://github.com/mercurius-js/mercurius/blob/master/LICENSE
 * @param {Array} [definition] the definitions from a graphQL document
 * @param {number} queryDepthLimit
 * @returns {Array} {Errors} An array of errors
 */
function validateQueryDepth({
  map,
  definitions,
  queryDepthLimit,
}: {
  map?: OperationsMap
  definitions?: ReadonlyArray<DefinitionNode>
  queryDepthLimit?: number
}) {
  if (!map && !definitions) {
    return []
  }

  const operationsMap =
    map || getOperationsMap(definitions as ReadonlyArray<DefinitionNode>)
  const queryDepth: { [key: string]: number } = {}

  for (const name in operationsMap) {
    if (name !== 'IntrospectionQuery') {
      queryDepth[name] = determineDepth(operationsMap[name])
    }
  }

  const errors = []
  if (typeof queryDepthLimit === 'number') {
    for (const query of Object.keys(queryDepth)) {
      const totalDepth = queryDepth[query]
      if (totalDepth > queryDepthLimit) {
        errors.push(
          toGraphQLError({
            message: `${query} query depth ${totalDepth} exceeds the query depth limit of ${queryDepthLimit}`,
          }),
        )
      }
    }
  }

  return errors
}

function determineDepth(node: any, current = 0) {
  if (node.selectionSet) {
    return Math.max(
      ...node.selectionSet.selections.map((selection: any) =>
        determineDepth(selection, current + 1),
      ),
    )
  }
  return current
}

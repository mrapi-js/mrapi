import { Kind } from 'graphql'
import { toGraphQLError } from './error'

/**
 * Returns the depth of nodes in a graphql query
 * Based on https://github.com/mercurius-js/mercurius/blob/master/lib/queryDepth.js
 * Copyright (c) 2018-2020 Matteo Collina and contributors
 * License (MIT License) https://github.com/mercurius-js/mercurius/blob/master/LICENSE
 * @param {Array} [definition] the definitions from a graphQL document
 * @param {number} queryDepthLimit
 * @returns {Array} {Errors} An array of errors
 */
export default function queryDepth(definitions: any, queryDepthLimit: number) {
  const queries = getQueriesAndMutations(definitions)
  const queryDepth: { [key: string]: number } = {}

  for (const name in queries) {
    if (name !== 'IntrospectionQuery') {
      queryDepth[name] = determineDepth(queries[name])
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

function getQueriesAndMutations(definitions: any) {
  return definitions.reduce((map: any, definition: any) => {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      map[definition.name ? definition.name.value : 'unnamedQuery'] = definition
    }
    return map
  }, {})
}

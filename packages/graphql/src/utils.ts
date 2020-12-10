import type { DefinitionNode } from 'graphql'
import type { OperationsMap } from './types'

import { Kind } from 'graphql'

export function getOperationsMap(
  definitions: readonly DefinitionNode[],
): OperationsMap {
  // TODO: when operation.name is undefined, should use fieldName instead
  return definitions.reduce(
    (map: OperationsMap, definition: DefinitionNode) => {
      if (definition.kind === Kind.OPERATION_DEFINITION) {
        map[
          definition.name ? definition.name.value : 'unnamedQuery'
        ] = definition
      }
      return map
    },
    {},
  )
}

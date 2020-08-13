import { getMesh, findAndParseConfig } from '@graphql-mesh/runtime'
import { stitchSchemas } from '@graphql-tools/stitch'
import path from 'path'
import { GraphQLSchema, ExecuteMeshFn, DefaultConfig } from '../types'

export async function meshSchema(
  baseDir: string,
  options: DefaultConfig,
): Promise<{
  schema: GraphQLSchema
  meshContext: Function
  execute: ExecuteMeshFn
}> {
  const customSchemas = require(path.join(baseDir, options.graphqlDir))
  // load dal graphql schema
  const meshConfig = await findAndParseConfig({ configName: 'mesh' })
  const { schema: dalSchema, contextBuilder, execute } = await getMesh(
    meshConfig,
  )
  const subschemas = [{ schema: dalSchema }]
  Object.keys(customSchemas).forEach((key) => {
    subschemas.push({ schema: customSchemas[key] })
  })
  const meshSchema = stitchSchemas({ subschemas })
  return { schema: meshSchema, meshContext: contextBuilder, execute }
}

import { getMesh } from '@graphql-mesh/runtime'
import { findAndParseConfig } from '@graphql-mesh/config'
import { stitchSchemas } from '@graphql-tools/stitch'
import path from 'path'
import { GraphQLSchema, ExecuteMeshFn, ApiOptions } from '../types'

export async function meshSchema(
  options: ApiOptions,
  schemas: GraphQLSchema[] = [],
): Promise<{
  schema: GraphQLSchema
  meshContext: Function
  execute: ExecuteMeshFn
}> {
  const customSchemas = require(path.join(process.cwd(), options.graphql.dir))
  // load dal graphql schema
  const meshConfig = await findAndParseConfig({ configName: 'mesh' })
  const { schema: dalSchema, contextBuilder, execute } = await getMesh(
    meshConfig,
  )
  const subschemas = schemas.map((schema) => ({ schema }))
  subschemas.push({ schema: dalSchema })
  Object.keys(customSchemas).forEach((key) => {
    subschemas.push({ schema: customSchemas[key] })
  })
  const meshSchema = stitchSchemas({ subschemas })
  return { schema: meshSchema, meshContext: contextBuilder, execute }
}

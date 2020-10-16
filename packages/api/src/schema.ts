import type { mrapi, GraphQLSchema, ExecuteMeshFn } from './types'

import { join, dirname } from 'path'
import { getMesh } from '@graphql-mesh/runtime'
import { stitchSchemas } from '@graphql-tools/stitch'
import { requireResolve, runShell } from '@mrapi/common'
import { findAndParseConfig } from '@graphql-mesh/config'

export async function meshSchemas(
  options: mrapi.api.Options,
  schemas: GraphQLSchema[] = [],
  logger: mrapi.Logger,
): Promise<{
  schema: GraphQLSchema
  execute: ExecuteMeshFn
}> {
  let meshConfig
  let execute
  const rootDir = process.cwd()
  const subschemas = schemas.map((schema) => ({ schema }))

  // load mesh config (support graphql-mesh's default config. e.g.: ./.meshrc.yml)
  try {
    meshConfig = await findAndParseConfig({
      configName: 'mesh',
      dir: join(rootDir, dirname(options.meshConfigOuputPath)),
    })
    logger.debug(`meshConfig: ${JSON.stringify(meshConfig, null, 0)}`)
  } catch (err) {
    throw new Error(`findAndParse mesh config error => ${err}`)
  }
  try {
    const { schema: schemaMesh, execute: executeFn } = await getMesh(meshConfig)
    execute = executeFn
    subschemas.push({ schema: schemaMesh })
  } catch (err) {
    logger.error(err)
  }

  // load custom graphql schemas
  if (options?.graphql?.dir) {
    const customSchemasPath = requireResolve(join(rootDir, options.graphql.dir))
    if (customSchemasPath) {
      const customSchemas = require(customSchemasPath)
      Object.keys(customSchemas).forEach((key) => {
        subschemas.push({ schema: customSchemas[key] })
      })
    } else {
      logger.debug('No custom schemas')
    }
  }

  const schema = stitchSchemas({ subschemas })
  return { schema, execute }
}

export const generateSchema = (schemaName: string) =>
  runShell(`npx mrapi generate --services ${schemaName}`)

export const generateSchemas = (schemaNames: string[]) =>
  Promise.all(schemaNames.map((name: string) => generateSchema(name)))

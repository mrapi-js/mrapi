import type { mrapi, GraphQLSchema, ExecuteMeshFn } from './types'

import { join, dirname } from 'path'
import { runShell } from '@mrapi/common'
import { getMesh } from '@graphql-mesh/runtime'
import { stitchSchemas } from '@graphql-tools/stitch'
import { findAndParseConfig } from '@graphql-mesh/config'

export async function meshSchema(
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
    logger.info(`meshConfig: ${JSON.stringify(meshConfig, null, 2)}`)
  } catch (err) {
    logger.warn(err)
  }
  try {
    const { schema, execute: executeFn } = await getMesh(meshConfig)
    execute = executeFn
    subschemas.push({ schema })
  } catch (err) {
    logger.error(err)
  }

  // load custom graphql schema
  if (options?.graphql?.dir) {
    const customSchemas = require(join(rootDir, options.graphql.dir))
    Object.keys(customSchemas).forEach((key) => {
      subschemas.push({ schema: customSchemas[key] })
    })
  }

  const schema = stitchSchemas({ subschemas })
  return { schema, execute }
}

export const generateSchema = (schemaName: string) =>
  runShell(`npx mrapi generate --name ${schemaName}`)

export const generateSchemas = (schemaNames: string[]) =>
  Promise.all(schemaNames.map((name: string) => generateSchema(name)))

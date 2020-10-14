import type { mrapi, GraphQLSchema } from './types'

import { printSchema } from 'graphql'
import { fs, getLogger } from '@mrapi/common'

import Server from './server'
import { resolveOptions } from './config'
import { meshSchema, generateSchemas } from './schema'

export * from './types'
export { getLogger } from '@mrapi/common'

export default class API {
  server: Server
  logger: mrapi.Logger
  private dal: any

  constructor(public options?: mrapi.api.Options, logger?: mrapi.Logger) {
    this.logger = getLogger(logger, {
      name: 'mrapi-api',
      ...(options?.logger || {}),
    })
    this.options = resolveOptions(options, this.logger)
    this.server = new Server(this.options, this.logger)
  }

  private async combinedWithDAL(): Promise<GraphQLSchema[]> {
    let DAL
    try {
      DAL = require('@mrapi/dal').default
    } catch (err) {
      throw new Error('please install "@mrapi/dal" manually')
    }
    this.dal = new DAL()
    const schemas = await this.dal.getSchemas()
    this.logger.info('[Start] get dal prisma/schema done')
    return schemas
  }

  private async startStandalone() {
    const { schema, execute } = await meshSchema(this.options, [], this.logger)
    await this.server.loadGraphql(schema, execute)
    await this.server.loadOpenapi()
    this.outputSchema(schema)
  }

  private async startCombined() {
    if (this.options.autoGenerate)
      await generateSchemas(this.options.schemaNames)

    const schemas = await this.combinedWithDAL()

    if (!Array.isArray(schemas)) {
      return
    }

    const { schema } = await meshSchema(this.options, schemas, this.logger)
    await this.server.loadGraphql(schema, undefined, this.dal)
    await this.server.loadOpenapi(this.dal)
    this.outputSchema(schema)
  }

  private async outputSchema(schema: GraphQLSchema) {
    await fs.outputFile('schema.graphql', printSchema(schema))
  }

  async start() {
    this.options.server?.type === 'combined'
      ? await this.startCombined()
      : await this.startStandalone()
    await this.server.start()
  }
}

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
    this.options = resolveOptions(options, this.logger)
    this.server = new Server(this.options, this.logger)
    this.logger = getLogger(logger, this.options.logger)
  }

  private combinedWithDAL(): GraphQLSchema[] {
    const { options } = this
    // get dal instance
    let DAL
    try {
      DAL = require('@mrapi/dal').default
    } catch (err) {
      throw new Error('please install "@mrapi/dal" manually')
    }
    const dal = new DAL(options.schemaNames.map((s) => ({ name: s })))
    this.dal = dal
    // add all schemas
    // TODO: use @marpi/dal's new getSchemas()
    options.schemaNames.forEach((name) => dal.addSchema(name))
    const schemas = options.schemaNames.map((name) => dal.getSchema(name))
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
    const schemas = this.combinedWithDAL()
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

import genConfig from './utils/gen-config'
import Server from './utils/server'
import { meshSchema } from './utils/graphql'
import { GraphQLSchema, ApiOptions } from './types'
import logger from './utils/logger'
import genPrisma from './utils/gen-prisma'
export * from './types'

export const log = logger
export default class API {
  baseDir: string
  options: ApiOptions
  server: Server
  private dal: any

  constructor(options: ApiOptions = {}) {
    this.baseDir = process.cwd()
    this.options = genConfig(options)
    this.server = new Server(this.options)
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
    options.schemaNames.forEach((name) => dal.addSchema(name))
    const schemas = options.schemaNames.map((name) => dal.getSchema(name))
    logger.info('[Start] get dal prisma/schema done')
    return schemas
  }

  private async startStandalone() {
    const { schema, execute } = await meshSchema(this.options)
    await this.server.loadGraphql(schema, execute)
    logger.info('[Start] load graphql done')
    await this.server.loadOpenapi()
    logger.info('[Start] load openapi done')
  }

  private async startCombined() {
    const { options, server } = this
    if (options.autoGenerate) await genPrisma(options.schemaNames)
    const schemas = this.combinedWithDAL()
    const { schema } = await meshSchema(options, schemas)
    await this.server.loadGraphql(schema, undefined, this.dal)
    logger.info('[Start] load graphql done')
    await server.loadOpenapi(this.dal)
    logger.info('[Start] load openapi done')
  }

  async start() {
    this.options.server.type === 'standalone'
      ? await this.startStandalone()
      : await this.startCombined()
    await this.server.start()
  }
}

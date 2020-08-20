import genConfig from './utils/gen-config'
import Server from './utils/server'
import { meshSchema } from './utils/graphql'
import { MrapiConfig, GraphQLSchema } from './types'
import logger from './utils/logger'
import genPrisma from './utils/gen-prisma'
export * from './types'

export const log = logger
export default class API {
  baseDir: string
  options: MrapiConfig
  server: Server
  dal: Array<{
    name: string
    prisemaClient: unknown
  }>

  constructor() {
    this.baseDir = process.cwd()
    this.options = genConfig()
    this.optionsVerify()
    this.server = new Server(this.options)
    this.dal = []
  }

  private optionsVerify() {
    // TODO
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
    const dal = new DAL(this.options.schemaNames.map(s => ({ name: s })))
    // add all schemas
    options.schemaNames.forEach(name => dal.addSchema(name))
    // get all schemas and prismaClient address
    const schema: GraphQLSchema[] = []
    options.schemaNames.forEach(name => {
      const prisma = dal.getPrisma(name)
      schema.push(prisma.schema)
      delete prisma.schema
      this.dal.push(Object.assign({ name }, prisma))
    })
    logger.info('[Start] get dal prisma/schema done')
    return schema
  }

  private async startStandalone() {
    const { schema, execute } = await meshSchema(this.options)
    await this.server.loadGraphql(schema, execute)
    logger.info('[Start] load graphql done')
    await this.server.loadOpenapi()
    logger.info('[Start] load openapi done')
  }

  private async startCombined() {
    await genPrisma()
    const schemas = this.combinedWithDAL()
    const { schema, execute } = await meshSchema(this.options, schemas)
    await this.server.loadGraphql(schema, execute)
    logger.info('[Start] load graphql done')
    await this.server.loadOpenapi()
    logger.info('[Start] load openapi done')
  }

  async start() {
    this.options.server.type === 'standalone'
      ? await this.startStandalone()
      : await this.startCombined()
    await this.server.start()
  }
}

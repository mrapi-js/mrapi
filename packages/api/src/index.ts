import { DefaultConfig } from './types'
import genConfig from './utils/gen-config'
import Server from './utils/server'
import { meshSchema } from './utils/graphql'

export default class API {
  prisma: unknown
  baseDir: string
  options: DefaultConfig
  server: Server
  dal: {
    getPrisma: any
    start: any
  }

  constructor() {
    this.baseDir = process.cwd()
    this.options = genConfig()
    this.server = new Server(this.options)
  }

  private combinedWithDAL() {
    let DAL
    try {
      DAL = require('@mrapi/dal')
    } catch (err) {
      throw new Error('please install "@mrapi/dal" manually')
    }

    this.dal = new DAL()
    this.prisma = this.dal.getPrisma()
  }

  async startStandalone() {
    const { schema, execute } = await meshSchema(this.baseDir, this.options)
    await this.server.loadGraphql(schema, execute)
  }

  async startCombined() {
    // TODO
    this.combinedWithDAL()
    this.dal.start()
  }

  async start() {
    this.options.server.type === 'standalone'
      ? await this.startStandalone()
      : await this.startCombined
    await this.server.start()
  }
}

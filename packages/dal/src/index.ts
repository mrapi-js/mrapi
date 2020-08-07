import { makeSchema } from '@nexus/schema'

import Server from './server'
import { createPrismaClient } from './prisma'

export type DALOptions = {
  name: string
  schema: any
}[]

export default class DAL {
  server: Server
  schemas: any[]

  constructor(options: DALOptions = []) {
    this.prepare(options)
  }

  getPrisma(options: any) {
    return createPrismaClient(options)
  }

  /**
   * prepare for graphql server
   *
   * @private
   * @param {DALOptions} options
   * @memberof DAL
   */
  private async prepare(options: DALOptions) {
    for (const option of options) {
      const schema = await this.generateSchema(option.schema)
      this.schemas.push({
        ...option,
        schema,
      })
    }
  }

  /**
   * generate graphql schema
   *
   * @private
   * @param {*} schema prisma schema
   * @param {string} [typegenDest='@prisma/client']
   * @param {*} [outputsDir=__dirname]
   * @returns
   * @memberof DAL
   */
  private async generateSchema(
    schema: any,
    typegenDest = '@prisma/client',
    outputsDir = __dirname,
  ) {
    // TODO: generate types vis prisma schema
    const types = require('../')

    // make schema
    return makeSchema({
      types,
      plugins: [],
      outputs: {
        schema: outputsDir + '/generated/schema.graphql',
        typegen: outputsDir + '/generated/nexus.ts',
      },
      typegenAutoConfig: {
        sources: [
          {
            source: typegenDest,
            alias: 'prisma',
          },
          {
            source: require.resolve('./context'),
            alias: 'Context',
          },
        ],
        contextType: 'Context.Context',
      },
    })
  }

  /**
   * add schema to existing server
   *
   * @param {string} name
   * @param {(Record<'schema' | string, any>)} options
   * @memberof DAL
   */
  async addSchema(name: string, options: Record<'schema' | string, any>) {
    if (!this.server) {
      throw new Error('server not started')
    }

    const schema = await this.generateSchema(options.schema)
    this.server.addRoute(name, { ...options, schema })
  }

  /**
   * remove schema from server
   *
   * @param {string} name
   * @memberof DAL
   */
  removeSchema(name: string) {
    if (!this.server) {
      throw new Error('server not started')
    }

    this.server.removeRoute(name)
  }

  /**
   * start server
   *
   * @param {*} [options={}]
   * @memberof DAL
   */
  async start(options = {}) {
    this.server = new Server()
    this.server.start(options)

    for (const [name, schema] of this.schemas) {
      this.server.addRoute(name, {
        schema,
      })
    }
  }
}

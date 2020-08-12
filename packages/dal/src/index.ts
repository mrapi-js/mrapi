import path from 'path'
import { makeSchema } from '@nexus/schema'
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'

import type { SchemaConfig } from '@nexus/schema/dist/builder'

import { merge } from '@mrapi/common'
import Server, { RouteOptions, ServerOption } from './server'
import { createPrismaClient } from './prisma'

export interface MakeSchemaOptions {
  schema: SchemaConfig
  outputsDir: string
  schemaDir: string
}

export type DALOptions = Array<{
  name?: string
  schema?: MakeSchemaOptions
  graphqlHTTP?: RouteOptions
}>

export default class DAL {
  server: Server

  schemas = new Map()

  graphqlHTTPOptions = new Map()

  constructor(options: DALOptions = []) {
    this.prepare(options).catch((e) => {
      console.error(e)
    })
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
      this.schemas.set(option.name, await this.generateSchema(option.schema))
      this.graphqlHTTPOptions.set(option.name, option.graphqlHTTP)
    }
  }

  /**
   * generate graphql schema
   *
   * @private
   * @returns
   * @memberof DAL
   */
  private async generateSchema({
    outputsDir = __dirname,
    schemaDir,
    schema,
  }: MakeSchemaOptions) {
    let types: any
    try {
      // TODO: generate types vis prisma schema
      types = require(schemaDir)
      console.log(types)
    } catch (e) {
      console.log('Error: require schema-type \n', e)
    }

    // make schema
    return makeSchema(
      merge(
        {
          types,
          plugins: [
            nexusSchemaPrisma({
              experimentalCRUD: true,
            }),
          ],
          outputs: {
            schema: path.join(outputsDir, '/generated/schema.graphql'),
            typegen: path.join(outputsDir, '/generated/nexus.ts'),
          },
          typegenAutoConfig: {
            sources: [
              {
                source: require.resolve('./context'),
                alias: 'Context',
              },
            ],
            contextType: 'Context.Context',
          },
          prettierConfig: require.resolve(
            path.join(__dirname, '../package.json'),
          ),
        },
        schema,
      ),
    )
  }

  /**
   * add schema to existing server
   *
   * @memberof DAL
   */
  async addSchema(
    name: string,
    options: { schema?: MakeSchemaOptions; graphqlHTTP?: RouteOptions },
  ) {
    if (!this.server) {
      throw new Error('Server not started')
    }

    let schema
    if (this.schemas.has(name)) {
      schema = this.schemas.get(name)
    } else {
      schema = await this.generateSchema(options.schema)
    }

    let graphqlHTTP
    if (this.schemas.has(name)) {
      graphqlHTTP = this.graphqlHTTPOptions.get(name)
    } else {
      graphqlHTTP = options.graphqlHTTP
    }

    this.server.addRoute(name, { ...graphqlHTTP, schema })
  }

  /**
   * remove schema from server
   *
   * @memberof DAL
   */
  removeSchema(name: string) {
    if (!this.server) {
      throw new Error('Server not started')
    }

    this.schemas.delete(name)

    this.graphqlHTTPOptions.delete(name)

    this.server.removeRoute(name)
  }

  /**
   * start server
   *
   * @memberof DAL
   */
  async start(options: ServerOption = {}) {
    this.server = new Server()
    this.server.start(options)

    for (const [name, _schema] of this.schemas) {
      await this.addSchema(name, {})
    }
  }
}

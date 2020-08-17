import path from 'path'
import isPlainObject from 'is-plain-object'
import { makeSchema } from '@nexus/schema'
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
import type { SchemaConfig } from '@nexus/schema/dist/builder'

import { merge } from '@mrapi/common'
import Server, { RouteOptions, ServerOptions } from './server'
import PMTManage from './prisma/PMTManage'

export interface MakeSchemaOptions {
  schema?: SchemaConfig | {}
  schemaDir: string
  prismaClientDir: string
}

export type DALOptions = Array<{
  name?: string
  schema?: MakeSchemaOptions
  graphqlHTTP?: RouteOptions
}>

export default class DAL {
  public server: Server

  public pmtManage = new PMTManage()

  private readonly schemas = new Map()

  private readonly graphqlHTTPOptions = new Map()

  private readonly prismaClients = new Map()

  constructor(options: DALOptions = []) {
    for (const option of options) {
      this.schemas.set(option.name, this.generateSchema(option.schema))
      this.graphqlHTTPOptions.set(option.name, option.graphqlHTTP)
      this.prismaClients.set(option.name, option.schema.prismaClientDir)
    }
  }

  /**
   * Generate graphql schema
   *
   * @private
   * @returns
   * @memberof DAL
   */
  private generateSchema({
    schema = {},
    schemaDir,
    prismaClientDir,
  }: MakeSchemaOptions) {
    let types: any
    try {
      // TODO: generate types vis prisma schema
      types = require(schemaDir)
      // console.log(types)
    } catch (e) {
      console.log(`Error: require ${schemaDir}... \n`, e)
    }

    const mergeOptions: merge.Options = {
      isMergeableObject: isPlainObject,
    }

    // make schema
    return makeSchema(
      merge(
        {
          types,
          // shouldGenerateArtifacts: process.env.NODE_ENV === 'development',
          plugins: [
            nexusSchemaPrisma({
              experimentalCRUD: true,
              inputs: {
                prismaClient: prismaClientDir,
              },
            }),
          ],
          outputs: {
            schema: path.join(prismaClientDir, '/generated/schema.graphql'),
            typegen: path.join(prismaClientDir, '/generated/nexus.ts'), // ts 文件在生成环境会不会有问题？
          },
          prettierConfig: require.resolve('../package.json'),
        },
        schema,
        mergeOptions,
      ),
    )
  }

  /**
   * Add schema to existing server
   *
   * @memberof DAL
   */
  addSchema(
    name: string,
    options: {
      schema?: MakeSchemaOptions
      graphqlHTTP?: RouteOptions
      prismaClient: any
    } = { prismaClient: null },
  ): boolean {
    let schema
    if (this.schemas.has(name)) {
      schema = this.schemas.get(name)
    } else {
      schema = this.generateSchema(options.schema)
      this.schemas.set(name, schema)
    }

    let graphqlHTTP
    if (this.schemas.has(name)) {
      graphqlHTTP = this.graphqlHTTPOptions.get(name)
    } else {
      graphqlHTTP = options.graphqlHTTP
      this.graphqlHTTPOptions.set(name, graphqlHTTP)
    }

    let prismaClient
    if (this.prismaClients.has(name)) {
      prismaClient = this.prismaClients.get(name)
    } else {
      prismaClient = options.prismaClient
      this.prismaClients.set(name, prismaClient)
    }

    let result = true
    // 未启服务时，仅添加配置
    if (this.server) {
      result = this.server.addRoute(name, {
        ...graphqlHTTP,
        schema,
        prismaClient,
      })
    }
    return result
  }

  /**
   * Remove schema from server
   *
   * @memberof DAL
   */
  removeSchema(name: string): boolean {
    let result = true
    if (this.server) {
      result = this.server.removeRoute(name)
    }

    if (result) {
      this.schemas.delete(name)
      this.graphqlHTTPOptions.delete(name)
      this.prismaClients.delete(name)
    }
    return result
  }

  /**
   * Start server
   *
   * @memberof DAL
   */
  async start(serverOptions?: ServerOptions) {
    if (!this.server) {
      this.server = new Server({ ...serverOptions }, this.pmtManage)
    }
    this.server.start()

    for (const [name, _schema] of this.schemas) {
      this.addSchema(name)
    }
  }

  /**
   * Stop server
   *
   * @memberof DAL
   */
  async stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }
    this.server.stop()
  }
}

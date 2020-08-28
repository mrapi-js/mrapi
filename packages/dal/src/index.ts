import path from 'path'
import chalk from 'chalk'
import isPlainObject from 'is-plain-object'
import { makeSchema } from '@nexus/schema'
import type { NexusGraphQLSchema } from '@nexus/schema/dist/definitions/_types'

import { merge, getConfig } from '@mrapi/common'
import PMTManage from './prisma/PMTManage'
import Server from './server'
import { getPrismaClient } from './prisma/getPrisma'
import { paljs } from './prisma/nexusPluginPaljs'
import type { MrapiConfig } from '@mrapi/common'
import type { RouteOptions, ServerOptions, DefaultTenant } from './types'

export interface MakeSchemaOptions {
  schema?: NexusGraphQLSchema | {}
  nexusDir: string
  prismaClientDir: string
}

export type DALOptions = Array<{
  name?: string
  schema?: MakeSchemaOptions
  graphqlHTTP?: RouteOptions
  defaultTenant?: DefaultTenant
}>

export default class DAL {
  public server: Server

  private readonly pmtManage: PMTManage

  private readonly mrapiConfig: MrapiConfig

  private readonly schemas: Map<string, NexusGraphQLSchema> = new Map()

  private readonly graphqlHTTPOptions: Map<string, RouteOptions> = new Map()

  private readonly prismaClients: Map<string, string> = new Map()

  private readonly defaultTenants: Map<string, DefaultTenant> = new Map()

  constructor(options: DALOptions = []) {
    this.mrapiConfig = getConfig()

    if (!this.mrapiConfig.managementUrl) {
      throw new Error('Please configure the "managementUrl".')
    }

    this.pmtManage = new PMTManage({
      managementUrl: this.mrapiConfig.managementUrl,
    })

    for (const option of options) {
      this.defaultTenants.set(option.name, option.defaultTenant)
      const schema = option?.schema || this.getDefaultSchemaOptions(option.name)
      this.schemas.set(option.name, this.generateSchema(schema))
      this.graphqlHTTPOptions.set(option.name, option.graphqlHTTP)
      this.prismaClients.set(option.name, schema.prismaClientDir)
    }
  }

  private getDefaultSchemaOptions(name: string) {
    const outputDir = path.join(process.cwd(), this.mrapiConfig.outputDir, name)
    return {
      nexusDir: path.join(outputDir, 'nexus-types'),
      prismaClientDir: outputDir,
    }
  }

  /**
   * Generate graphql schema
   *
   * @private
   * @returns NexusGraphQLSchema
   */
  private generateSchema({
    schema = {},
    nexusDir,
    prismaClientDir,
  }: MakeSchemaOptions) {
    let types: any
    try {
      const requireDirTypes = require(nexusDir)
      types = requireDirTypes.default || requireDirTypes
    } catch (e) {
      console.log(
        `${chalk.red(`Error: require nexus types "${nexusDir}"...`)}\n`,
        e,
      )
    }

    const mergeOptions: merge.Options = {
      isMergeableObject: isPlainObject,
    }

    // make schema
    return makeSchema(
      merge(
        {
          types,
          plugins: [paljs({ prismaClient: prismaClientDir })],
          shouldGenerateArtifacts: process.env.NODE_ENV !== 'production', // 感觉生成的文件，只是方便编写 types
          outputs: {
            schema: path.join(prismaClientDir, '/generated/schema.graphql'),
            typegen: path.join(prismaClientDir, '/generated/nexus.ts'),
          },
          prettierConfig: require.resolve('../package.json'),
        },
        schema,
        mergeOptions,
      ),
    )
  }

  /**
   * Get @nexus/schema options
   *
   */
  getSchema(name: string) {
    if (this.schemas.has(name)) {
      return this.schemas.get(name)
    }

    throw new Error(
      `"${name}" was not found. Please call "dal.addSchema" first.`,
    )
  }

  /**
   * Get prisma instance by PMT
   *
   */
  getPrisma = async (name: string, tenantName: string) => {
    let defaultTenant: DefaultTenant = {}
    if (!tenantName) {
      defaultTenant = this.defaultTenants.get(name) || {}
    }

    return await this.pmtManage
      .getPrisma(name, defaultTenant.name || tenantName, defaultTenant.url)
      .catch((e: any) => {
        // TODO: 多租户异常时，保证 DEV 可以正常访问连接。
        if (process.env.NODE_ENV === 'production') {
          throw e
        }
        console.error(e)
        console.log(
          chalk.red(
            `Tips: Check to see if a multi-tenant identity "${this.mrapiConfig.tenantIdentity}" has been added to the "Request Headers".`,
          ),
        )
      })
  }

  /**
   * Add schema to existing server
   *
   */
  addSchema(
    name: string,
    options: {
      schema?: MakeSchemaOptions
      graphqlHTTP?: RouteOptions
      defaultTenant?: DefaultTenant
    } = {},
  ): boolean {
    if (!this.defaultTenants.has(name)) {
      this.defaultTenants.set(name, options.defaultTenant)
    }

    let schema
    if (this.schemas.has(name)) {
      schema = this.schemas.get(name)
    } else {
      schema = this.generateSchema(
        options?.schema || this.getDefaultSchemaOptions(name),
      )
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
      prismaClient =
        options?.schema?.prismaClientDir ||
        this.getDefaultSchemaOptions(name).prismaClientDir
      this.prismaClients.set(name, prismaClient)
    }

    // Set PMT PrismaClient
    this.pmtManage.setPMT(name, {
      PrismaClient: getPrismaClient(prismaClient),
    })

    let result = true
    // If server not started, only the configuration is added
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
   */
  removeSchema(name: string): boolean {
    let result = true
    if (this.server) {
      result = this.server.removeRoute(name)
    }

    if (result) {
      this.defaultTenants.delete(name)
      this.schemas.delete(name)
      this.graphqlHTTPOptions.delete(name)
      this.prismaClients.delete(name)

      // Delete pmt PrismaClient
      this.pmtManage.setPMT(name)
    }
    return result
  }

  /**
   * Start server
   *
   */
  async start(serverOptions?: ServerOptions) {
    if (!this.server) {
      this.server = new Server(
        { tenantIdentity: this.mrapiConfig.tenantIdentity, ...serverOptions },
        this.getPrisma,
      )
    }
    this.server.start()

    for (const [name, _schema] of this.schemas) {
      this.addSchema(name)
    }
  }

  /**
   * Stop server
   *
   */
  async stop() {
    if (!this.server) {
      throw new Error('Server not started')
    }
    this.server.stop()
  }
}

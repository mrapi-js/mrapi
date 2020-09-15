import path from 'path'
import chalk from 'chalk'
import { isPlainObject } from 'is-plain-object'
import { makeSchema } from '@nexus/schema'
import type { GraphQLSchema } from 'graphql'

import { merge, getConfig, getPrismaClient } from '@mrapi/common'
import { paljsPlugin } from '@mrapi/nexus'
import PMTManage from './prisma/PMTManage'
import Server from './server'
import type { MrapiConfig } from '@mrapi/common'
import type {
  graphqlOptions,
  openAPIOptions,
  ServerOptions,
  DefaultTenant,
  DALSchemaOptions,
  DALOptions,
} from './types'

export default class DAL {
  public server: Server

  private readonly pmtManage: PMTManage

  private readonly mrapiConfig: MrapiConfig

  private readonly prismaClients: Map<string, string> = new Map()

  private readonly defaultTenants: Map<string, DefaultTenant> = new Map()

  private readonly graphqlOptions: Map<string, graphqlOptions> = new Map()

  private readonly openAPIOptions: Map<string, openAPIOptions> = new Map()

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

      const { nexusDir, prismaClientDir } = this.getDefaultSchemaOptions(
        option.name,
        option,
      )
      this.prismaClients.set(option.name, prismaClientDir)

      const graphqlOption: {
        enable?: boolean
        options?: graphqlOptions
      } = option?.graphql || { enable: true }

      const makeSchemaData = this.generateSchema({
        schema: graphqlOption?.options?.schema,
        nexusDir,
        prismaClientDir,
      })

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      if (graphqlOption.enable !== false) {
        this.graphqlOptions.set(option.name, {
          ...(graphqlOption?.options || {}),
          schema: makeSchemaData,
        })
      }

      const openAPIOption: {
        enable?: boolean
        options?: openAPIOptions
      } = option.openAPI || this.getDefaultOpenAPIOptions(option.name)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      if (openAPIOption.enable !== false) {
        this.openAPIOptions.set(option.name, openAPIOption.options)
      }
    }
  }

  private getDefaultSchemaOptions(
    name: string,
    options: { [name: string]: any },
  ) {
    const outputDir = path.join(process.cwd(), this.mrapiConfig.outputDir, name)
    return {
      nexusDir: options.nexusDir || path.join(outputDir, 'nexus-types'),
      prismaClientDir: options.prismaClientDir || outputDir,
    }
  }

  private getDefaultOpenAPIOptions(name: string) {
    const outputDir = path.join(process.cwd(), this.mrapiConfig.outputDir, name)
    return {
      enable: true,
      options: { oasDir: path.join(outputDir, 'api') },
    }
  }

  /**
   * Generate graphql schema
   *
   * @private
   */
  private generateSchema({
    schema,
    nexusDir,
    prismaClientDir,
  }: {
    schema?: GraphQLSchema | {}
    nexusDir: string
    prismaClientDir: string
  }) {
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
          plugins: [paljsPlugin({ prismaClient: prismaClientDir })],
          shouldGenerateArtifacts: process.env.NODE_ENV !== 'production', // 感觉生成的文件，只是方便编写 types
          outputs: {
            schema: path.join(prismaClientDir, '/generated/schema.graphql'),
            typegen: path.join(prismaClientDir, '/generated/nexus.ts'),
          },
          prettierConfig: require.resolve('../package.json'),
        },
        schema || {},
        mergeOptions,
      ),
    )
  }

  /**
   * Get @nexus/schema options
   *
   */
  getSchema(name: string): GraphQLSchema {
    if (this.graphqlOptions.has(name)) {
      return this.graphqlOptions.get(name)?.schema
    }

    throw new Error(
      `"${name}" was not found. Please call "dal.addSchema" first.`,
    )
  }

  /**
   * Get prisma instance by PMT
   *
   */
  getPrisma = async (name: string, tenantName?: string) => {
    let defaultTenant: DefaultTenant = {}
    if (!tenantName) {
      defaultTenant = this.defaultTenants.get(name) || {}
    }

    return await this.pmtManage
      .getPrisma(name, defaultTenant.name || tenantName, defaultTenant.url)
      .catch((e: any) => {
        // In the event of a multi-tenant exception, the document connection is guaranteed to be properly accessed.
        if (this.mrapiConfig?.dal?.pmtErrorThrow) {
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
   * Return server has schema
   */
  hasSchema(name: string) {
    return this.prismaClients.has(name)
  }

  /**
   * Add schema to existing server
   *
   * Note: If "name" already exists, Please call "dal.removeSchema" first
   *
   */
  addSchema(name: string, option: DALSchemaOptions = {}): boolean {
    if (!this.defaultTenants.has(name)) {
      this.defaultTenants.set(name, option.defaultTenant)
    }

    const { nexusDir, prismaClientDir } = this.getDefaultSchemaOptions(
      name,
      option,
    )

    let prismaClient
    let defaultGraphqlOption = { enable: true }
    let defaultOpenAPIOption = { enable: true }
    if (this.prismaClients.has(name)) {
      prismaClient = this.prismaClients.get(name)
      // Fixbug: Initialization configuration conflict
      defaultGraphqlOption = { enable: false }
      defaultOpenAPIOption = { enable: false }
    } else {
      prismaClient = prismaClientDir
      this.prismaClients.set(name, prismaClient)
    }
    // Set PMT PrismaClient
    this.pmtManage.setPMT(name, {
      PrismaClient: getPrismaClient(prismaClient),
    })

    const graphqlOption: {
      enable?: boolean
      options?: graphqlOptions
    } = option?.graphql || defaultGraphqlOption

    let graphql
    if (this.graphqlOptions.has(name)) {
      graphql = this.graphqlOptions.get(name)
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    else if (graphqlOption.enable !== false) {
      const schema = this.generateSchema({
        schema: graphqlOption?.options?.schema,
        nexusDir,
        prismaClientDir,
      })
      graphql = {
        ...graphqlOption.options,
        schema,
      }
      this.graphqlOptions.set(name, graphql)
    }

    const openAPIOption: {
      enable?: boolean
      options?: openAPIOptions
    } = option.openAPI || {
      ...this.getDefaultOpenAPIOptions(name),
      ...defaultOpenAPIOption,
    }
    let openAPI
    if (this.openAPIOptions.has(name)) {
      openAPI = this.openAPIOptions.get(name)
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    else if (openAPIOption.enable !== false) {
      openAPI = openAPIOption.options
      this.openAPIOptions.set(name, openAPI)
    }

    let result = true
    // If server not started, only the configuration is added
    if (this.server) {
      result = this.server.addRoute(name, {
        graphql,
        openAPI,
        enableRepeat: this.mrapiConfig.dal?.enableRepeatRoute,
        prismaClientDir,
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
      this.prismaClients.delete(name)
      this.graphqlOptions.delete(name)
      this.openAPIOptions.delete(name)

      // Delete pmt PrismaClient
      this.pmtManage.setPMT(name)
    }
    return result
  }

  /**
   * Start server
   *
   * Note: When service is initialized, the default port configuration is logged.
   *
   */
  async start(serverOptions?: ServerOptions) {
    if (!this.server) {
      this.server = new Server(
        { tenantIdentity: this.mrapiConfig.tenantIdentity, ...serverOptions },
        this.getPrisma,
      )
    }
    this.server.start(serverOptions)

    for (const [name] of this.prismaClients) {
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

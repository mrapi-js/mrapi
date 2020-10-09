import type { mrapi } from './types'
import type { GraphQLSchema } from 'graphql'

import { join } from 'path'
import { paljsPlugin } from '@mrapi/nexus'
import { makeSchema } from '@nexus/schema'
import { PrismaClient } from '@prisma/client'
import { isPlainObject } from 'is-plain-object'
import { MultiTenant } from '@prisma-multi-tenant/client'
import { merge, getPrismaClient, getUrlAndProvider } from '@mrapi/common'

import { defaultServiceOptions } from './config'

export default class Service {
  name: string
  multiTenant: MultiTenant<PrismaClient>

  constructor(
    public options: mrapi.dal.ServiceOptions,
    public logger: mrapi.Logger,
  ) {
    this.options = {
      ...(defaultServiceOptions as mrapi.dal.ServiceOptions),
      ...(options || {}),
    }
    this.name = this.options.name
    this.init()
  }

  private async init() {
    this.setManager()

    const prismaClient: PrismaClient = getPrismaClient(
      this.options.paths.prismaClient,
    )

    if (!prismaClient) {
      this.logger.error(
        `please generate PrismaClient for "${this.name}" service first`,
      )
      return
    }

    this.multiTenant = new MultiTenant({
      PrismaClient: prismaClient,
      ...this.options,
    })

    if (this.options.graphql.enable) {
      delete this.options.graphql.enable
      this.options.graphql.schema = this.generateSchema(
        this.options.graphql.schema,
      )
    } else {
      delete this.options.graphql
    }

    if (this.options.openapi.enable) {
      delete this.options.openapi.enable
    } else {
      delete this.options.openapi
    }
  }

  private setManager() {
    // set environment variables for prisma-multi-tanent
    const { url, provider } = getUrlAndProvider(this.options.management.dbUrl)
    process.env.MANAGEMENT_PROVIDER = provider
    process.env.MANAGEMENT_URL = url
  }

  release() {
    if (this.multiTenant) {
      this.multiTenant.disconnect()
    }
  }

  async getPrismaClient(tenantName?: string, tenantUrl?: string) {
    const name = tenantName || this.options.defaultTenant.name

    if (tenantUrl) {
      const prisma = await this.multiTenant.directGet({
        name,
        url: tenantUrl,
      })
      return prisma
    }

    return this.multiTenant.get(name)
  }

  /**
   * Generate graphql schema
   *
   * @private
   */
  private generateSchema(schema?: GraphQLSchema) {
    let types: any
    try {
      const requireDirTypes = require(this.options.paths.nexus + '/')
      types = requireDirTypes.default || requireDirTypes
    } catch (e) {
      console.log(e)
      this.logger.error(`require nexus types "${this.options.paths.nexus}"`, e)
      process.exit(1)
    }

    const mergeOptions: merge.Options = {
      isMergeableObject: isPlainObject,
    }

    // make schema
    const prismaClientPath = this.options.paths.prismaClient
    return makeSchema(
      merge(
        {
          types,
          plugins: [paljsPlugin({ prismaClient: prismaClientPath })],
          shouldGenerateArtifacts: process.env.NODE_ENV !== 'production', // 感觉生成的文件，只是方便编写 types
          outputs: {
            schema: join(prismaClientPath, '/generated/schema.graphql'),
            typegen: join(prismaClientPath, '/generated/nexus.ts'),
          },
          prettierConfig: require.resolve('../package.json'),
          nonNullDefaults: {
            output: true,
          },
        },
        schema || {},
        mergeOptions,
      ),
    )
  }
}

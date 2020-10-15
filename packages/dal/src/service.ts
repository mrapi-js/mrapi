import type { mrapi } from './types'
import type { GraphQLSchema } from 'graphql'

import DB from '@mrapi/db'
import { join } from 'path'
import { paljsPlugin } from '@mrapi/nexus'
import { makeSchema } from '@nexus/schema'
import { PrismaClient } from '@prisma/client'
import { isPlainObject } from 'is-plain-object'
import { fs, merge, getPrismaClient } from '@mrapi/common'

import { defaultServiceOptions } from './config'
import { migrateSave, migrateUp } from './helpers/migrate/'

interface DBInitParams {
  database?: string
  schema: string
  Client: PrismaClient
}

export default class Service {
  name: string
  db: DB<PrismaClient>

  constructor(
    public options: mrapi.dal.ServiceOptions,
    public logger: mrapi.Logger,
  ) {
    this.options = {
      ...(defaultServiceOptions as mrapi.dal.ServiceOptions),
      ...(options || {}),
    }
    this.name = this.options.name
  }

  async init() {
    console.log()
    this.logger.debug(`initialize service "${this.name}"...`)

    const prismaClientPath = this.options?.paths?.outputPrismaClient
    if (!prismaClientPath || !fs.pathExistsSync(prismaClientPath)) {
      this.logger.error(
        'PrismaClient not generated yet. Please run "mrapi generate" first.',
      )
      process.exit(1)
    }
    const TenantClient: PrismaClient = getPrismaClient(prismaClientPath)

    let ManagementClient: PrismaClient
    if (typeof this.options.db !== 'string' && this.options.db?.management) {
      const prismaManagementClientPath = this.options.db.management
        .outputPrismaClient
      if (
        !prismaManagementClientPath ||
        !fs.pathExistsSync(prismaManagementClientPath)
      ) {
        this.logger.error(
          'PrismaManagementClient not generated yet. Please run "mrapi generate" first.',
        )
        process.exit(1)
      }
      ManagementClient = getPrismaClient(prismaManagementClientPath)
    }

    try {
      await this.initDB(TenantClient, ManagementClient)
    } catch (err) {
      this.logger.error(err)
      return
    }

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
    this.logger.debug(`initialize service "${this.name}" done!`)
  }

  private async initDB(
    TenantClient: PrismaClient,
    ManagementClient: PrismaClient,
  ) {
    const dbOptions = {
      ...(typeof this.options.db === 'string'
        ? { db: this.options.db }
        : this.options.db),
      TenantClient,
      ManagementClient,
      migrateFn: async ({ database, schema }: DBInitParams) => {
        await migrateSave({
          schema,
          dbUrl: database,
        })
        await migrateUp({
          schema,
          dbUrl: database,
        })
      },
    }
    this.db = new DB<PrismaClient>(dbOptions, this.logger)
    await this.db.init()
  }

  release() {
    return this.db.disconnect()
  }

  async getTenantClient(tenantName?: string) {
    let tenant
    try {
      tenant = await this.db.get(tenantName)
    } catch {}

    return tenant?.client
  }

  /**
   * Generate graphql schema
   *
   * @private
   */
  private generateSchema(schema?: GraphQLSchema) {
    let types: any
    try {
      const requireDirTypes = require(this.options.paths.outputGraphql + '/')
      types = requireDirTypes.default || requireDirTypes
    } catch (e) {
      console.log(e)
      this.logger.error(
        `require nexus types "${this.options.paths.outputGraphql}"`,
        e,
      )
      process.exit(1)
    }

    const mergeOptions: merge.Options = {
      isMergeableObject: isPlainObject,
    }

    // make schema
    const prismaClient = this.options.paths.outputPrismaClient
    return makeSchema(
      merge(
        {
          types,
          plugins: [paljsPlugin({ prismaClient })],
          shouldGenerateArtifacts: process.env.NODE_ENV !== 'production', // 感觉生成的文件，只是方便编写 types
          outputs: {
            schema: join(prismaClient, '/generated/schema.graphql'),
            typegen: join(prismaClient, '/generated/nexus.ts'),
          },
          prettierConfig: require.resolve('../package.json'),
          nonNullDefaults: {
            // Whether output fields are non-null by default. default: false
            output: true,
            // Whether input fields (field arguments, input type members) are non-null by default. default: false
            // input: true,
          },
        },
        schema || {},
        mergeOptions,
      ),
    )
  }
}

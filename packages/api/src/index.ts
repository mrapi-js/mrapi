import type { mrapi, GraphQLSchema } from './types'

import { relative } from 'path'
import { printSchema } from 'graphql'
import { fs, getLogger, ensureAbsolutePath } from '@mrapi/common'

import Server from './server'
import { meshSchemas, generateSchemas } from './schema'
import { defaultOutputSchemaPath, resolveOptions } from './config'

export * from './types'
export { getLogger } from '@mrapi/common'

/**
 * TODO: expose app.graphql types
 */

/**
 * ## API
 * create a GraphQL or OpenAPI service
 *
 * @example
 * ```
 * const app = new API()
 *
 * // start the API server
 * app.start().catch((err: Error) => {
 *   app.logger.error(err)
 * })
 * ```
 *
 */
export class API {
  /**
   * FastifyInstance, equals to server's app.
   *
   * @type {FastifyInstance}
   * @memberof API
   */
  app: mrapi.api.App
  /**
   * API server
   *
   * @type {Server}
   * @memberof API
   */
  server: Server
  /**
   * logger
   *
   * @type {mrapi.Logger}
   * @memberof API
   */
  logger: mrapi.Logger
  private dal: any

  constructor(protected options?: mrapi.api.Options, logger?: mrapi.Logger) {
    this.logger = getLogger(logger, {
      ...(options?.logger || {}),
      name: 'mrapi-api',
    })
    this.options = resolveOptions(options, this.logger)
    this.server = new Server(this.options, this.logger)
    this.app = this.server.app
  }

  /**
   * Initialze API service base on configured mode, then start the server
   *
   * @returns
   * @memberof API
   */
  async start() {
    this.options.server?.type === 'combined'
      ? await this.startCombined()
      : await this.startStandalone()
    const result = await this.server.start()

    return result
  }

  private async getDALSchemas(): Promise<GraphQLSchema[]> {
    let DAL
    try {
      const { DAL: DALClass } = require('@mrapi/dal')
      DAL = DALClass
    } catch (err) {
      throw new Error(
        'combined mode needs "@mrapi/dal", please install it manually',
      )
    }
    this.dal = new DAL({
      logger: this.options?.logger || {},
    })
    // just get the schemas
    const schemas = await this.dal.getSchemas()
    this.logger.debug(`[Start] get dal services's schemas done`)
    return schemas
  }

  private async startStandalone() {
    this.logger.debug('Start standalone mode ...')
    const { schema, execute } = await meshSchemas(this.options, [], this.logger)
    await this.server.loadGraphql(schema, execute)
    await this.server.loadOpenapi()
    this.outputSchema(schema)
  }

  private async startCombined() {
    this.logger.debug('Start combined mode ...')
    if (this.options.autoGenerate) {
      await generateSchemas(this.options.schemaNames)
    }

    const schemas = await this.getDALSchemas()

    if (!Array.isArray(schemas)) {
      return
    }

    const { schema } = await meshSchemas(this.options, schemas, this.logger)
    await this.server.loadGraphql(schema, undefined, this.dal)
    await this.server.loadOpenapi(this.dal)
    this.outputSchema(schema)
  }

  private async outputSchema(schema: GraphQLSchema) {
    if (this.options.outputSchema) {
      const path =
        typeof this.options.outputSchema === 'string'
          ? this.options.outputSchema
          : defaultOutputSchemaPath
      const absolutePath = ensureAbsolutePath(path)
      await fs.outputFile(absolutePath, printSchema(schema))
      this.logger.debug(
        `GraphQL schema output at: ${relative(process.cwd(), absolutePath)}`,
      )
    }
  }
}

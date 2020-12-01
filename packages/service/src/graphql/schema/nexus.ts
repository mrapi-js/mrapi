import type { GraphQLSchema } from 'graphql'

import { join } from 'path'
import { defaults, tryRequire, FILE_HEADER } from '@mrapi/common'

export default function getSchema({
  customPath,
  generatedPath,
  datasourcePath,
  contextFile,
  plugins,
  mock,
}: {
  customPath: string
  generatedPath: string
  datasourcePath: string
  contextFile: string
  plugins: string[]
  mock: any
}): GraphQLSchema {
  const {
    makeSchema,
    declarativeWrappingPlugin,
  }: typeof import('@nexus/schema') = tryRequire(
    '@nexus/schema',
    'Please install it manually.',
  )
  let types: any[] = []
  let datasourceModuleName: string

  // https://nexusjs.org/docs/plugins/declarativeWrapping#declarative-wrapping
  // TODO: if paljs/generator updated, declarativeWrappingPlugin() should be removed
  const nexusPlugins = [declarativeWrappingPlugin()]
  const generatedTypes = tryRequire(generatedPath)
  const customTypes = tryRequire(customPath)
  types = types.concat(
    Array.isArray(generatedTypes) ? generatedTypes : [generatedTypes],
  )
  types = types.concat(Array.isArray(customTypes) ? customTypes : [customTypes])

  if (datasourcePath && plugins.includes('nexus-plugin-prisma')) {
    const prismaPlugin = resolvePrismaPlugin(datasourcePath)
    nexusPlugins.push(prismaPlugin)
    datasourceModuleName = datasourcePath.split('node_modules/')[1]
  }

  // TODO: support custom prettier config
  let prettierConfig = {
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'all',
  }

  const schema = makeSchema({
    types,
    prettierConfig,
    plugins: nexusPlugins,
    nonNullDefaults: {
      // Whether output fields are non-null by default. default: false
      output: true,
      // Whether input fields (field arguments, input type members) are non-null by default. default: false
      // input: true,
    },
    shouldGenerateArtifacts: false,
    // outputs: {
    //   typegen: join(generateTo, 'nexus.d.ts'),
    //   schema: join(generateTo, 'api.graphql'),
    // },
    outputs: false,
    ...(!!datasourcePath
      ? {
          typegenAutoConfig: {
            headers: [FILE_HEADER],
            backingTypeMap: {
              DateTime: 'Date',
              Email: 'string',
              JSONObject: 'prisma.JsonObject',
            },
            contextType: 'ctx.Context',
            sources: [
              {
                alias: 'ctx',
                source: contextFile,
              },
              {
                alias: 'prisma',
                source: join(datasourceModuleName!, 'index.d.ts'),
              },
              {
                alias: 'models',
                source: join(customPath, 'models/index.ts'),
                // Note: This will match any declared type in models if the name matches
                typeMatch: (type) => [new RegExp(`(${type.name})`)],
              },
            ],
            debug: true,
          },
        }
      : {}),
  })

  if (mock) {
    const {
      addMocksToSchema,
    }: typeof import('@graphql-tools/mock') = tryRequire(
      '@graphql-tools/mock',
      'You are using graphql mock, please install it manually.',
    )
    const mocks = typeof mock === 'object' ? mock : {}
    return addMocksToSchema({ schema, mocks })
  }

  return schema
}

function resolvePrismaPlugin(datasourcePath: string) {
  const { nexusPrisma }: typeof import('nexus-plugin-prisma') = tryRequire(
    'nexus-plugin-prisma',
    'Please install it manually.',
  )

  const valid = checkDatasource(datasourcePath)

  if (!valid) {
    throw new Error(
      `You most likely forgot to initialize the Prisma Client. Please run \`npx mrapi setup\`, then try to run it again.`,
    )
  }

  return nexusPrisma({
    // https://nexusjs.org/docs/pluginss/prisma/overview#configuration
    /**
     * nexus-prisma will call this to get a reference to an instance of the Prisma Client.
     * The function is passed the context object. Typically a Prisma Client instance will
     * be available on the context to support your custom resolvers. Therefore the
     * default getter returns `ctx.prisma`.
     */
    // prismaClient?: PrismaClientFetcher
    // keep default, because paljs using `prisma`: https://github.com/paljs/prisma-tools/blob/master/packages/generator/src/nexus/templates/findOne.ts
    // prismaClient: (ctx) => ctx.db,
    /**
     * Same purpose as for that used in `Nexus.makeSchema`. Follows the same rules
     * and permits the same environment variables. This configuration will completely
     * go away once Nexus has typeGen plugin support.
     */
    shouldGenerateArtifacts: false,
    /**
     * Enable experimental CRUD capabilities.
     * Add a `t.crud` method in your definition block to generate CRUD resolvers in your `Query` and `Mutation` GraphQL Object Type.
     *
     * @default false
     */
    experimentalCRUD: true,
    inputs: {
      /**
       * What is the path to the Prisma Client package? By default looks in
       * `node_modules/@prisma/client`. This is needed in order to read your Prisma
       * schema AST and Prisma Client CRUD info from the generated Prisma Client package.
       */
      prismaClient: datasourcePath,
    },
    // outputs: {
    /**
     * Where should nexus-prisma put its typegen on disk?
     *
     * @default 'node_modules/@types/typegen-nexus-plugin-prisma/index.d.ts'
     *
     * @remarks
     *
     * This configuration will completely go away once Nexus has typeGen plugin
     * support.
     *
     */
    //   typegen: join(_, 'nexus-prisma.d.ts'),
    // },
  })
}

function checkDatasource(datasourcePath?: string, provider = 'prisma') {
  const path = datasourcePath || defaults.clientPath
  const client = path ? tryRequire(path, undefined, false) : null
  return !!client && (provider === 'prisma' ? client.prismaVersion : true)
}

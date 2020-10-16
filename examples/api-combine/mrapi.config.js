const { join, resolve } = require('path')

const commonTransforms = [
  {
    resolversComposition: [
      {
        resolver: '*.*',
        composer: resolve(
          join(
            __dirname,
            `./${
              process.env.NODE_ENV === 'production' ? 'dist' : 'src'
            }/graphql/middlewares/openapi`,
          ),
        ),
      },
    ],
  },
]

// options for prisma client
const prismaOptions = {
  log:
    process.env.NODE_ENV === 'production'
      ? ['warn', 'error']
      : ['query', 'info', 'warn', 'error'],
  errorFormat: 'minimal', // 'pretty' | 'colorless' | 'minimal'
}

// middlewares for prisma
const prismaMiddlewares = [
  async (params, next) => {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()
    console.log(
      `Prisma Middleware: Query ${params.model}.${params.action} took ${after -
        before}ms`,
    )
    return result
  },
]

module.exports = {
  api: {
    schemaNames: ['music', 'blog'],
    server: {
      type: 'combined',
      port: 1359,
    },
    graphql: {
      dir: '/src/graphql',
    },
    openapi: {
      dir: '/src/openapi',
    },
    service: {
      sources: [
        {
          //  The name you wish to set to your remote API, this will be used for building the GraphQL context
          name: 'blog',
          handler: {
            graphql: {
              // A url to your remote GraphQL endpoint
              endpoint: 'http://localhost:1358/graphql',
              operationHeaders: {
                'mrapi-tenant-id': '{context.tenant}',
              },
            },
          },
          // List of transforms to apply to the current API source, before unifying it with the rest of the sources
          // transforms: [...commonTransforms],
        },
      ],
      // Transform to apply to the unified mesh schema
      transforms: [],
      serve: {
        exampleQuery: resolve(__dirname, './examples/users.graphql'),
      },
    },
    outputSchema: false, // output path string or boolean
    tenantIdentity: 'mrapi-tenant-id',
  },
  dal: {
    services: [
      {
        name: 'music',
        db: {
          // tenants: [
          //   {
          //     name: 'default',
          //     // use sqlite if database if empty
          //     database: '',
          //     // or: use mysql, pg
          //     // database: 'mysql://root:123456@0.0.0.0:3306/test',
          //   },
          //   // {
          //   //   name: 'blog',
          //   //   database: 'mysql://root:123456@0.0.0.0:3306/blog',
          //   // },
          // ],
          // 2
          tenants: {
            a: 'mysql://root:123456@0.0.0.0:3306/music-a',
            b: 'mysql://root:123456@0.0.0.0:3306/music-b',
          },
          defaultTenant: 'a',
          prismaOptions,
          prismaMiddlewares,
        },
      },
    ],
    // enabled services management
    management: {
      database: 'mysql://root:123456@0.0.0.0:3306/dal-management',
    },
  },
}

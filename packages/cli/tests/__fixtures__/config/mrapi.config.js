module.exports = {
  service: {
    name: 'default',
    schema: './prisma/schema.prisma',
    database: 'file:./dev.db',
    datasource: {
      provider: 'prisma',
      schema: './prisma/schema.prisma',
      output: '',
    },
    graphql: {
      output: '',
      custom: '',
      playground: true,
      generator: 'nexus', // or 'type-graphql'
      generatorOptions: {},
      queryDepth: 10,
      introspection: false,
    },
    openapi: {
      output: '',
      custom: '',
      generatorOptions: {
        excludeFields: [],
        excludeModels: [],
        excludeFieldsByModel: {},
        excludeQueriesAndMutations: [],
        excludeQueriesAndMutationsByModel: {},
      },
    },
    customDir: '',
    tenants: [
      {
        name: 'one',
        database: 'file:./post-one.db',
      },
      {
        name: 'two',
        database: 'file:./post-two.db',
      },
    ],
    multiTenant: {
      mode: 'single-db', // or 'seprate-db'
      default: '',
      identity: 'mrapi-tenant-id',
    },
    mock: true,
    management: true,
    managementTenantModelName: '',
    contextFile: '',
  },
  gateway: {
    services: [
      {
        name: '',
        url: '',
        methods: ['GET'],
      },
    ],
  },
}

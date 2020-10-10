exports.default = {
  dal: {
    services: [
      {
        name: 'one',
        schema: './config/one.prisma',
        tenants: {
          dev: '',
          // prod: '',
        },
        defaultTenant: 'dev',
        openapi: {
          enable: true,
        },
        paths: {
          input: '',
          output: '',
          nexus: '',
        },
      },
      {
        name: 'two',
        tenants: {
          dev: '',
        },
        defaultTenant: 'dev',
        openapi: {
          enable: false,
        },
        // graphql: {
        //   enable: false,
        // },
      },
    ],
    management: {
      enable: true,
      schema: './config/management.prisma',
      // database: 'file:./database/management.db',
    },
  },
}

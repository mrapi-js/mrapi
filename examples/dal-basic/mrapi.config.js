exports.default = {
  dal: {
    // managementUrl: 'file:config/db/management.db',
    // enableRepeatRoute: false,
    // pmtErrorThrow: true,
    services: [
      {
        name: 'one',
        schema: './config/one.prisma',
        tenants: {
          dev: '',
        },
        defaultTenant: 'dev',
        // defaultTenant: {
        //   name: 'dev',
        //   // url: 'file:../config/db/prod.db',
        // },
        openapi: {
          enable: true,
        },
        paths: {
          input: '',
          output: '',
          nexus: '',
          // prismaClient: '',
          // managementClient: '',
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
        // nexusDir?: string;
        // prismaClientDir?: string;
      },
    ],
    management: {
      enable: true,
      schema: './config/management.prisma',
      database: 'file:./database/management.db',
      prismaClient: '',
    },
    // logger: 111,
    // aaa: 0,
  },
  // managementUrl: 'mysql://root:123456@127.0.0.1/management'
}

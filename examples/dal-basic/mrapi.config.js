exports.default = {
  dal: {
    server: {},
    managementUrl: 'file:config/db/management.db',
    enableRepeatRoute: false,
    // pmtErrorThrow: true,
    services: [
      {
        name: 'one',
        defaultTenant: {
          name: 'dev',
          // url: 'file:../config/db/prod.db',
        },
        openapi: {
          enable: true,
        },
      },
      {
        name: 'two',
        defaultTenant: {
          name: 'dev',
        },
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
  },
  // managementUrl: 'mysql://root:123456@127.0.0.1/management'
}

module.exports = {
  dal: {
    services: [
      {
        name: 'blog',
        db: {
          tenants: {
            tencent: '',
            alibaba: '',
          },
          defaultTenant: 'tencent',
        },
      },
      {
        name: 'music',
        db: {
          tenants: {
            tencent: '',
            alibaba: '',
          },
          defaultTenant: 'tencent',
        },
        openapi: {
          enable: false,
        },
      },
    ],
    // enabled services management
    management: {},
  },
}

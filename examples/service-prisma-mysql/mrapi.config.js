module.exports = {
  service: [
    {
      name: 'user',
      schema: 'prisma/user/schema.prisma',
      graphql: true,
      tenants: [
        {
          name: 'one',
          database: 'mysql://root:123456@0.0.0.0:3306/dev-user-one',
        },
        {
          name: 'two',
          database: 'mysql://root:123456@0.0.0.0:3306/dev-user-two',
        },
      ],
      defaultTenant: 'one',
    },
    {
      name: 'post',
      schema: 'prisma/post/schema.prisma',
      database: 'mysql://root:123456@0.0.0.0:3306/dev-post',
      graphql: true,
    },
    {
      name: 'management',
      schema: 'prisma/management/schema.prisma',
      // relative to schema
      database: 'file:./dev.db',
      management: true,
    },
  ],
}

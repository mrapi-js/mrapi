module.exports = {
  service: [
    {
      name: 'user',
      schema: 'prisma/user/schema.prisma',
      tenants: [
        {
          name: 'one',
          // relative to schema
          database: 'file:./user-one.db',
        },
        {
          name: 'two',
          // relative to schema
          database: 'file:./user-two.db',
        },
      ],
      defaultTenant: 'one',
    },
    {
      name: 'post',
      schema: 'prisma/post/schema.prisma',
      // relative to schema
      database: 'file:./post.db',
    },
    {
      name: 'management',
      schema: 'prisma/management/schema.prisma',
      // relative to schema
      database: 'file:./dev.db',
      management: true,
    },
  ],
  graphql: {
    stitching: ['user', 'post'],
  },
}

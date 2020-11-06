module.exports = {
  service: [
    {
      name: 'user',
      schema: 'prisma/user/schema.prisma',
      tenants: [
        {
          name: 'one',
          database: 'file:./user-one.db',
        },
        {
          name: 'two',
          database: 'file:./user-two.db',
        },
      ],
      defaultTenant: 'one',
    },
    {
      name: 'post',
      schema: 'prisma/post/schema.prisma',
      database: 'file:./post.db',
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
      defaultTenant: 'one',
    },
    {
      name: 'management',
      schema: 'prisma/management/schema.prisma',
      database: 'file:./dev.db',
      management: true,
    },
  ],
}

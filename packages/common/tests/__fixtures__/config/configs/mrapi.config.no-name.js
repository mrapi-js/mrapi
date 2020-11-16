module.exports = {
  service: [
    {
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
      multiTenant: {
        default: 'one',
      },
    },
    {
      name: 'post',
      schema: 'prisma/post/schema.prisma',
      database: 'file:./post.db',
    },
  ],
}

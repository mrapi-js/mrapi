module.exports = {
    service: {
      schema: 'prisma/schema.prisma',
      database: 'file:./dev.db',
      name:null,
      tenants: [
        {
          name: null,
          database: 'file:./user-one.db',
        },
        {
          // name: 'two',
          database: 'file:./user-two.db',
        },
      ],
    },
  }
  
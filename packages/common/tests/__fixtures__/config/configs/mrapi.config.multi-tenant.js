module.exports = {
  service: {
    schema: 'prisma/schema.prisma',
    database: 'file:./dev.db',
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
  },
}

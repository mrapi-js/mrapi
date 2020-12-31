// module.exports = {
//   provider: 'prisma',
//   services: [{
//     name: string
//     database: string
//     tenants: TenantOptions[]
//     multiTenant: MultiTenantOptions
//     clientPath: string
//   }]
// }

module.exports = {
  provider: 'prisma',
  services: [
    {
      name: 'default',
      database: 'file:./dev.db',
      // tenants: TenantOptions[]
      // multiTenant: MultiTenantOptions
      clientPath: '.',
    },
  ],
}

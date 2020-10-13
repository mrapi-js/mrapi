module.exports = {
  dal: {
    services: [
      {
        name: 'blog',
        db: {
          tenants: {
            // empty: use default name from './config/*.prisma'
            // tencent: '',
            // MySQL
            tencent: 'mysql://root:123456@0.0.0.0:3306/blog',
          },
        },
      },
    ],
  },
}

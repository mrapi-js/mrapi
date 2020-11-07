import { extendType, stringArg, objectType } from '@nexus/schema'

const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id', { nullable: false, description: 'id' })
    t.string('name', { nullable: false, description: 'user name' })
  },
})

const userQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: User,
      args: { name: stringArg() },
      async resolve(_, { name }, _ctx) {
        return {
          id: 1,
          name: name || 'x',
        }
      },
    })
  },
})

export { userQuery }

import { extendType, objectType } from '@nexus/schema'

const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id', { nullable: false })
  },
})

const userQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('users', {
      type: User,
      async resolve(_, _args, _ctx) {
        return {
          id: 1,
        }
      },
    })
  },
})

export { userQuery }

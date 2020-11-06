import { extendType, stringArg, objectType, arg } from '@nexus/schema'
import { Context } from '.mrapi/context'

const ServerTime = objectType({
  name: 'ServerTime',
  definition(t) {
    t.string('time', { nullable: false, description: 'current server time' })
  },
})

const customQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('serverTime', {
      description: 'Get current timestamp on server',
      type: ServerTime,
      args: { type: stringArg() },
      async resolve(_root, _args, _ctx: Context, _info) {
        return { time: String(Date.now()) }
      },
    })

    t.field('me', {
      type: 'User',
      description: 'Get current user info',
      args: {
        where: arg({ type: 'UserWhereInput', required: true }),
        orderBy: arg({ type: 'UserOrderByInput', list: true }),
        cursor: 'UserWhereUniqueInput',
        skip: 'Int',
        take: 'Int',
      },
      nullable: true,
      async resolve(_root, args, ctx: Context, _info) {
        return ctx.prisma.user.findFirst(args)
      },
    })

    t.field('draft', {
      type: 'Post',
      description: 'Get current timestamp on server',
      nullable: true,
      args: {
        where: arg({ type: 'PostWhereInput', required: true }),
        orderBy: arg({ type: 'PostOrderByInput', list: true }),
        cursor: 'PostWhereUniqueInput',
        skip: 'Int',
        take: 'Int',
      },
      resolve: (_root, args, ctx: Context) => {
        return ctx.prisma.post.findFirst(args)
      },
    })
  },
})

export { customQuery }

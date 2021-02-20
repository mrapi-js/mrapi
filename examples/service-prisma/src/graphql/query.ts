import { extendType, stringArg, objectType, arg, list } from 'nexus'
import { Context } from '../context'

const ServerTime = objectType({
  name: 'ServerTime',
  definition(t) {
    t.nonNull.string('time', { description: 'current server time' })
  },
})

export const customQuery = extendType({
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

    t.nullable.field('me', {
      type: 'User',
      description: 'Get current user info',
      async resolve(_root, _args, ctx: Context, _info) {
        console.log('me', ctx.req.headers, ctx.userId)
        return ctx.prisma.user.findUnique({
          where: {
            id: ctx.userId,
          },
        })
      },
    })

    t.list.field('drafts', {
      type: 'Post',
      description: 'Get unpublished posts',
      args: {
        where: arg({ type: 'PostWhereInput' }),
        orderBy: arg({ type: list('PostOrderByInput') }),
        cursor: 'PostWhereUniqueInput',
        skip: 'Int',
        take: 'Int',
      },
      resolve(_root, args, ctx: Context) {
        return ctx.prisma.post.findMany({
          ...args,
          where: {
            ...args.where,
            published: {
              equals: false,
            },
          },
        })
      },
    })
  },
})

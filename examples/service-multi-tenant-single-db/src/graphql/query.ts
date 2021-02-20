import { extendType } from 'nexus'
import { Context } from '../context'

export const customQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nullable.field('me', {
      type: 'User',
      description: 'Get current user info',
      async resolve(_root, _args, ctx: Context, _info) {
        console.log('me', ctx.req.headers, ctx.userId)
        return ctx.prisma.user.findOne({
          where: {
            id: ctx.userId,
          },
        })
      },
    })
  },
})

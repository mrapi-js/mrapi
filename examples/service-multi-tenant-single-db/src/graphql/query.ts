import { extendType } from '@nexus/schema'
import { Context } from '../context'

export const customQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('me', {
      type: 'User',
      description: 'Get current user info',
      nullable: true,
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

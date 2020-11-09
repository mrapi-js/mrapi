import { arg, extendType } from '@nexus/schema'
import { Context } from './context'

const customQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('me', {
      type: 'User',
      description: 'Get current timestamp on server',
      nullable: true,
      args: {
        where: arg({ type: 'UserWhereInput', required: true }),
        orderBy: arg({ type: 'UserOrderByInput', list: true }),
        cursor: 'UserWhereUniqueInput',
        skip: 'Int',
        take: 'Int',
      },
      resolve: (_root, args, ctx: Context) => {
        console.log('me', ctx.req.headers)
        return ctx.prisma.user.findFirst(args)
      },
    })
  },
})

export { customQuery }

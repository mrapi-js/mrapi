import { arg, extendType } from '@nexus/schema'
import { Context } from '../context'

export const customQuery = extendType({
  type: 'Query',
  definition(t) {
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
        console.log('draft', ctx.req.headers)
        return ctx.prisma.post.findFirst(args)
      },
    })
  },
})

import { arg, extendType } from '@nexus/schema'
import { Context } from '.mrapi/post/context'

const customQuery = extendType({
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
        return ctx.prisma.post.findFirst(args)
      },
    })
  },
})

export { customQuery }

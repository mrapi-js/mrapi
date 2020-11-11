import { arg, extendType } from '@nexus/schema'
import { Context } from '../context'

export const customQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('drafts', {
      type: 'Post',
      description: 'Get unpublished posts',
      args: {
        where: arg({ type: 'PostWhereInput' }),
        orderBy: arg({ type: 'PostOrderByInput', list: true }),
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

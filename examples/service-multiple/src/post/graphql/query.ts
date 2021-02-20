import { extendType, objectType } from 'nexus'
import { Context } from '../context'

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.nonNull.int('id', { description: 'id' })
    t.nonNull.string('title', { description: 'post title' })
  },
})

export const postQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('post', {
      type: Post,
      async resolve(_, _args, ctx: Context) {
        console.log('post', ctx.req.headers)
        return {
          id: 1,
          title: '1st post',
        }
      },
    })
  },
})

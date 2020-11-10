import { extendType, objectType } from '@nexus/schema'
import { Context } from '../context'

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id', { nullable: false, description: 'id' })
    t.string('title', { nullable: false, description: 'post title' })
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

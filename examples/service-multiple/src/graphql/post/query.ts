import { extendType, objectType } from '@nexus/schema'

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id', { nullable: false, description: 'id' })
    t.string('title', { nullable: false, description: 'post title' })
  },
})

const postQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('post', {
      type: Post,
      async resolve(_, _args, _ctx) {
        return {
          id: 1,
          title: '1st post',
        }
      },
    })
  },
})

export { postQuery }

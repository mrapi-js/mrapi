import { objectType, queryType } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  definition (t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.Post({
      pagination: false
    })
  }
})

export const Post = objectType({
  name: 'Post',
  definition (t) {
    t.model.id()
    t.model.title()
    t.model.content()
    t.model.published()
    t.model.authorId()
  }
})

export const Query = queryType({
  definition (t) {
    t.crud.user()
    t.crud.post()

    t.field('publish', {
      type: 'Post',
      resolve (_root, args, ctx) {
        console.log(ctx)
        return ctx.db.post.update({
          data: {
            published: true
          }
        })
      }
    })
  }
})

export const Mutation = objectType({
  name: 'Mutation',
  definition (t) {
    t.crud.createOneUser()
    t.crud.deleteOnePost()
  }
})

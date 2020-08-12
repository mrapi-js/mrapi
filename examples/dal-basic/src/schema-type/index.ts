import { objectType, queryType } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  definition (t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.posts({
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
  }
})

export const Mutation = objectType({
  name: 'Mutation',
  definition (t) {
    t.crud.createOneUser()
    t.crud.deleteOnePost()
  }
})

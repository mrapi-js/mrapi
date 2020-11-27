import { rule, shield,  not,or } from 'graphql-shield'
import { Context } from '../context'
const isAuthenticated = rule({ cache: 'contextual' })(
    async (parent:any, args:any, ctx:Context, info:any) => {
      return  new Error("没有权限");// true pass
    },
  )
 export const permission = shield({
    Query: {
      serverTime: isAuthenticated,
      user:isAuthenticated
    },
    User:isAuthenticated
  })

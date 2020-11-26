import { rule, shield,  not,or } from 'graphql-shield'
import { Context } from '../context'
const isAuthenticated = rule({ cache: 'contextual' })(
    async (parent:any, args:any, ctx:Context, info:any) => {

        try{
            const result = await ctx.prisma.user.findMany({})
            console.log("----:result:",result)
        }catch(error){
             console.log("-----",error);
        }
        
      return  new Error("没有权限");// true pass
    },
  )
 const permission = shield({
    Query: {
      serverTime: isAuthenticated,
      post:isAuthenticated
    },
    Post:isAuthenticated
  })
  export { permission}
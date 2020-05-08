import { Ctx, Query, Resolver } from 'type-graphql'
import { Context } from '@mrapi/core'

@Resolver()
export class TestResolver {
  @Query((_) => String, { nullable: true, description: 'xxxx' })
  async test(@Ctx() ctx: Context): Promise<String> {
    // console.log(ctx.request.cookies)
    // ctx.reply.setCookie('foo', 'foo')

    // ctx.prisma.user.count({})

    return 'test'
  }
}

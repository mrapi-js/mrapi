import { Query, Resolver } from 'type-graphql'

@Resolver()
export class SampleResolver {
  @Query((_returns) => Date, {
    nullable: true,
    description: 'Current DateTime',
  })
  serverTime() {
    // console.log(ctx.request.cookies)
    // ctx.reply.setCookie('foo', 'foo')
    // ctx.prisma.user.count({})

    return new Date()
  }
}

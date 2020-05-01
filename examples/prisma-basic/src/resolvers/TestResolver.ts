import { Ctx, Query, Resolver } from 'type-graphql'
import { ContextWithPrisma } from '@mrapi/core/lib/types'

@Resolver()
export class TestResolver {
  @Query((_) => String, { nullable: true, description: 'xxxx' })
  async test(@Ctx() ctx: ContextWithPrisma): Promise<String> {
    // ctx.prisma.
    return 'test'
  }
}

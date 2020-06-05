import {
  Ctx,
  Root,
  Arg,
  Args,
  PubSub,
  Publisher,
  Query,
  Mutation,
  Resolver,
  Subscription,
} from 'type-graphql'
import { Context } from '@mrapi/core'

import log from '../../utils/logger'
import { Notification, NotificationPayload } from '../models/Notification'

@Resolver()
export class SampleResolver {
  @Query((returns) => Date)
  currentDate() {
    return new Date()
  }

  @Query((_) => String, { nullable: true, description: 'xxxx' })
  async test(@Ctx() ctx: Context): Promise<String> {
    // console.log(ctx.request.cookies)
    // ctx.reply.setCookie('foo', 'foo')

    // ctx.prisma.user.count({})

    return 'test'
  }

  @Mutation((returns) => Boolean)
  async createNotification(
    @PubSub('NOTIFICATIONS') publish: Publisher<NotificationPayload>,
    @Arg('message', { nullable: true }) message?: string,
  ): Promise<boolean> {
    await publish({ id: Math.floor(Math.random() * 10000), message })
    return true
  }

  @Subscription({
    topics: 'NOTIFICATIONS',
  })
  newNotification(
    @Root() notificationPayload: NotificationPayload,
    @Args() args: JSON,
  ): Notification {
    log.info({ args })
    return {
      ...notificationPayload,
      date: new Date(),
    }
  }
}

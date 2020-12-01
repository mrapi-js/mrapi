import { extendType, stringArg, objectType } from '@nexus/schema'
import { Context } from '../context'

const ServerTime = objectType({
  name: 'ServerTime',
  definition(t) {
    t.nonNull.string('time', { description: 'current server time' })
  },
})

export const timeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('serverTime', {
      description: 'Get current timestamp on server',
      type: ServerTime,
      args: { type: stringArg() },
      async resolve(_, _args, ctx: Context) {
        console.log(ctx.req.headers)
        return { time: String(Date.now()) }
      },
    })
  },
})

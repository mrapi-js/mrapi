import { extendType, stringArg, objectType } from '@nexus/schema'
import { Context } from '../context'

const ServerTime = objectType({
  name: 'ServerTime',
  definition(t) {
    t.string('time', { nullable: false, description: 'current server time' })
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
        return { time: String(Date.now()) }
      },
    })
  },
})

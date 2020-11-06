import { extendType, stringArg, objectType } from '@nexus/schema'

const ServerTime = objectType({
  name: 'ServerTime',
  definition(t) {
    t.string('time', { nullable: false, description: 'current server time' })
  },
})

const timeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('serverTime', {
      description: 'Get current timestamp on server',
      type: ServerTime,
      args: { type: stringArg() },
      async resolve(_, _args, _ctx) {
        return { time: String(Date.now()) }
      },
    })
  },
})

export { timeQuery }

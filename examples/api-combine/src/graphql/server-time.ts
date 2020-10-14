import { queryType, stringArg, makeSchema } from '@nexus/schema'

const Query = queryType({
  definition(t) {
    t.field('serverTime', {
      type: 'String',
      description: 'get server time',
      args: { type: stringArg() },
      resolve() {
        return String(Date.now())
      },
    })
  },
})

export const servTimeSchema = makeSchema({
  types: [Query],
  outputs: false,
})

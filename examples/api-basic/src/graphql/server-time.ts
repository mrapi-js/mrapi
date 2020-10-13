import { queryType, stringArg, objectType, makeSchema } from '@nexus/schema'

const ServerTimeOutputType = objectType({
  name: 'ServerTimeOutputType',
  definition(t) {
    t.string('time', { nullable: false, description: 'current server time' })
  },
})

const Query = queryType({
  definition(t) {
    t.field('serverTime', {
      type: ServerTimeOutputType,
      args: { type: stringArg() },
      async resolve(_, args, { execute }) {
        console.log(args, execute)
        // const { data } = await execute(`
        //   query auth_users {
        //     auth_users(where: { id: { equals: "ckd5d4qpi00111i17jinkjswa" } }) {
        //       id: true,
        //       username: true,
        //     }
        //   }
        // `)
        // console.log(data)
        return { time: String(Date.now()) }
      },
    })
  },
})

export const serverTimeSchema = makeSchema({
  types: [ServerTimeOutputType, Query],
})

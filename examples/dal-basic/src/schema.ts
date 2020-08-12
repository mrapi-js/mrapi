import { makeSchema } from '@nexus/schema'
import path from 'path'
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'

import * as allTypes from './schema-type'

export const schema = makeSchema({
  types: allTypes,
  outputs: {
    schema: path.join(__dirname, '/generated/schema.graphql'),
    typegen: path.join(__dirname, '/generated/nexus.ts')
  },
  plugins: [
    nexusSchemaPrisma({
      experimentalCRUD: true
    })
  ],
  typegenAutoConfig: {
    contextType: 'ctx.Context',
    sources: [
      {
        alias: 'ctx',
        source: path.join(__dirname, './context.ts')
      }
    ],
    backingTypeMap: {
      Date: 'Date'
    }
  },
  prettierConfig: require.resolve(path.join(__dirname, '../package.json'))
})

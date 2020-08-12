import DAL, { DALOptions } from '@mrapi/dal'
import path from 'path'

import Context from './context'

const options: DALOptions = [
  {
    name: 'dev',
    schema: {
      outputsDir: path.join(__dirname, 'dev'),
      schemaDir: path.join(__dirname, './schema.ts'),
    },
    graphqlHTTP: {
      context: new Context(),
    },
  },
]

const app = new DAL(options)

app.start()

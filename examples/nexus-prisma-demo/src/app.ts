// import DAL, { DALOptions } from '@mrapi/dal'

// const options: DALOptions = [
//   {
//     name: 't1',
//     schema: {},
//   },
// ]

// const app = new DAL(options)

// app.start()

import express from 'express'
import { graphqlHTTP } from 'express-graphql'

import Context from './context'
import { schema } from './schema'

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
    context: new Context()
  })
)

app.listen(4000)

console.log('🚀 Server ready at: http://localhost:4000')

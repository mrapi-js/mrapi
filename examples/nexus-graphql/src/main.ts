import schema from './schema'
import { createContext } from './context'

const Fastify = require('fastify')
const GQL = require('fastify-gql')
const app = Fastify()

app.register(GQL, {
  ide:"playground",
  schema
})

app.get('/', async function (req, reply) {
 
  return reply.send(100)
})

app.listen(3000,(err, address) => {
  if (err) {
     console.log(err)
    process.exit(1)
  }
  console.log(`🚀 Server ready at http://localhost:3000`)
  console.log(`🚀 Server ready at http://localhost:3000/playground`)
})

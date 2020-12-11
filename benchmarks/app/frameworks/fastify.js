const fastify = require('fastify')()

let n = parseInt(process.env.MW || '0', 10)

while (n--) {
  fastify.register((fastify, opts, done) => {
    done()
  })
}

fastify.get('/', function (req, reply) {
  reply.send('hello world!')
})

fastify.listen(3000)

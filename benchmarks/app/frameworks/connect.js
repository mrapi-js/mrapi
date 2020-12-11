const connect = require('connect')

const app = connect()

let n = parseInt(process.env.MW || '0', 10)

while (n--) {
  app.use((req, res, next) => next())
}

app.use(function (req, res) {
  res.end('hello world!')
})

app.listen(3000)

const express = require('express')

const app = express()

app.disable('etag')
app.disable('x-powered-by')

let n = parseInt(process.env.MW || '0', 10)

while (n--) {
  app.use((req, res, next) => next())
}

app.get('/', function (req, res) {
  res.end('hello world!')
})

app.listen(3000)

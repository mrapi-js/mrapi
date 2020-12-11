const polka = require('polka')

const app = polka()

let n = parseInt(process.env.MW || '0', 10)

while (n--) {
  app.use((req, res, next) => next())
}

app.get('/', (req, res) => {
  res.end('hello world!')
})

app.listen(3000)

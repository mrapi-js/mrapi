const { App } = require('@mrapi/app')

const app = new App({
  cache: 1000,
})

let n = parseInt(process.env.MW || '0', 10)

while (n--) {
  app.use((req, res, next) => next())
}

app
  .on('GET', '/', (_req, res) => {
    res.end('hello world!')
  })
  .listen(3000, err => {
    if (err) {
      throw err
    }
  })

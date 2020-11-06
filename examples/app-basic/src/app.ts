import { App } from '@mrapi/app'

const app = new App()

app
  .get('/', (_req, res) => {
    res.end('Hello World!')
  })
  .listen(3000, (err: any) => {
    if (err) {
      throw err
    }

    console.log(app.routes)
    console.log(
      `Server listening at http://localhost:${
        (app.server?.address() as any)?.port
      }`,
    )
  })

setTimeout(() => {
  app.off('GET', '/test-0/:id?')
  console.log(app.routes)
}, 5000)

setTimeout(() => {
  for (let i = 0; i < 3; i++) {
    app.on('GET', `/test-${i}/:id?`, (req, res) => {
      res.end(`test- ${i}, ${req.params.id}`)
    })
  }
  console.log(app.routes)
}, 1000)

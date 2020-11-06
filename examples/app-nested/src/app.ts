import { App } from '@mrapi/app'

const app = new App({
  cache: 10000,
})

const subApp = new App()

subApp
  .get('/foo', (req, res) => {
    res.end(`hello from foo, query: ${JSON.stringify(req.query)}`)
  })
  .get('/bar/:id?', (req, res) => {
    res.end(
      `hello from bar, query: ${JSON.stringify(
        req.query,
      )}, params: ${JSON.stringify(req.params)}`,
    )
  })

app.use('/v1', subApp).listen(3000, (err: any) => {
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

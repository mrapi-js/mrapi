import { App } from '@mrapi/app'
import { json } from 'body-parser'
import cookieParser from 'cookie-parser'
// import compression from 'compression'

const app = new App({
  cache: 10000,
})

app
  // .use(compression()) // missing `res.flush`
  .use(json())
  .use(cookieParser())
  .use(async (req, _res, next) => {
    console.log(req.cookies)
    console.log('~>before 1')
    await next()
    console.log('<~after 1')
  })
  .get('/', (req, res) => {
    console.log('-', req.cookies, req.query)
    res.send(req.query)
  })
  .post('/user', (req, res) => {
    console.log('-', req.cookies, req.query, req.body)
    res.send(req.body)
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

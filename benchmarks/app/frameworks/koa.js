const Koa = require('koa')
const router = require('@koa/router')()

const app = new Koa()

let n = parseInt(process.env.MW || '0', 10)

while (n--) {
  app.use((ctx, next) => next())
}

router.get('/', async function (ctx) {
  ctx.body = 'hello world!'
})

app.use(router.routes())

app.on('error', error => {
  if (error.code === 'EPIPE') {
  } else {
    console.error('Koa app-level error', { error })
  }
})

app.listen(3000)

// const app = new Koa()

// let n = parseInt(process.env.MW || '0', 10)

// while (n--) {
//   app.use((ctx, next) => next())
// }

// app.use(ctx => {
//   ctx.body = 'hello world!'
// })

// app.on('error', error => {
//   if (error.code === 'EPIPE') {
//   } else {
//     console.error('Koa app-level error', { error })
//   }
// })

// app.listen(3000)

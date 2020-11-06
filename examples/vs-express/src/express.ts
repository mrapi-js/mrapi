import express from 'express'

const app = express()

const fns = new Array(6)
  .fill(0)
  .map((_, idx: number) => (_req: any, _res: any, next: any) => {
    console.log(`fn${idx}`)
    next()
  })

app
  .get('/', fns[0])
  .use(fns[1])
  .get('/users/1', fns[2])
  .use('/users', fns[3])
  .use('/users/*', fns[4])
  .use('/users/:id', fns[5])
  .listen(3000, () => {
    console.log(`Express listening at http://localhost:3000`)
  })

/**

=> /           fn0, fn1
=> /users      fn1, fn3
=> /users/     fn1, fn3, fn4
=> /users/1    fn1, fn2, fn3, fn4, fn5
=> /users/2    fn1, fn3, fn4, fn5

*/

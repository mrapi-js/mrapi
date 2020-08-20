import DAL, { DALOptions } from '@mrapi/dal'

const options: DALOptions = [
  {
    name: 'one',
  },
  // {
  //   name: 'two',
  // },
]

const app = new DAL(options)

let timer: any
app
  .start()
  .then(() => {
    timer = setTimeout(() => {
      // // stop test
      // app.stop().then(() => console.log('stop'))
      // // removeSchema test
      // const ok = app.removeSchema('one')
      // ok && console.log('removeSchema one')
      // // addSchema test
      const ok2 = app.addSchema('two')
      ok2 && console.log('addSchema two ok')
    }, 1000 * 3)
  })
  .catch((e) => {
    clearTimeout(timer)
    timer = null

    console.error(e)
  })

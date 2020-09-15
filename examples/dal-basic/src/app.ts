import DAL from '@mrapi/dal'
import type { DALOptions } from '@mrapi/dal/lib/types'

const options: DALOptions = [
  {
    name: 'one',
    defaultTenant: {
      name: 'dev',
      // url: 'file:../config/db/prod.db',
    },
  },
  {
    name: 'two',
    // defaultTenant: {
    //   name: 'dev',
    // },
    openAPI: {
      enable: false,
    },
    // graphql: {
    //   enable: false,
    // },
    // nexusDir?: string;
    // prismaClientDir?: string;
  },
]

const app = new DAL(options)

let timer: any
app
  .start()
  .then(() => {
    // const thisApp = app.server.app

    timer = setTimeout(async () => {
      // // stop test
      // app.stop().then(() => {
      //   console.log('stop')
      //   setTimeout(() => {
      //     // restart
      //     app.start({ port: 1360 })
      //   }, 1000 * 3)
      // })
      // // removeSchema test
      // const ok = app.removeSchema('one')
      // ok && console.log('removeSchema one')
      // // addSchema test
      // const ok2 = app.addSchema('two', {
      //   defaultTenant: {
      //     name: 'dev',
      //   },
      //   openAPI: {
      //     enable: false,
      //   },
      // })
      // ok2 && console.log('addSchema two ok')
      // // getSchema
      // console.log(app.getSchema('one'))
      // // getPrisma
      // const prisma = await app.getPrisma('one', 'dev')
      // console.log(prisma)
      // // hasSchema
      // console.log("app.hasSchema('one') -> ", app.hasSchema('one'))
      // // Repeat addRoute
      // const ok3 = app.addSchema('one', {
      //   defaultTenant: {
      //     name: 'dev',
      //   },
      // })
      // console.log('Repeat addSchema one ->', ok3)
    }, 1000 * 3)
  })
  .catch((e) => {
    clearTimeout(timer)
    timer = null

    console.error(e)
  })

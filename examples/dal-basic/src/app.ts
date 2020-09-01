import DAL, { DALOptions } from '@mrapi/dal'
// import { initialize } from 'express-openapi'
// import path from 'path'

const options: DALOptions = [
  {
    name: 'one',
    defaultTenant: {
      name: 'dev', // 视乎可以不要 name
      // url: 'file:../config/db/prod.db',
    },
  },
  // {
  //   name: 'two',
  //   defaultTenant: {
  //     name: 'dev',
  //   },
  // },
]

const app = new DAL(options)

let timer: any
app
  .start()
  .then(() => {
    // const thisApp = app.server.app

    // const openAPIPath = path.join(__dirname, '../', 'api')
    // console.log(openAPIPath)
    // initialize({
    //   validateApiDoc: false,
    //   app: thisApp,
    //   apiDoc: require('../api/api-doc').default,
    //   dependencies: {
    //     worldsService: require('../api/services/worldsService').default,
    //     // getPrisma: async (req: any) => {
    //     //   return ''
    //     // },
    //   },
    //   paths: path.join(openAPIPath, 'paths'),
    //   // pathsIgnore: new RegExp('.(spec|test)$'),
    // })

    timer = setTimeout(() => {
      // // stop test
      // app.stop().then(() => console.log('stop'))
      // // removeSchema test
      // const ok = app.removeSchema('one')
      // ok && console.log('removeSchema one')
      // // addSchema test
      // const ok2 = app.addSchema('two', {
      //   defaultTenant: {
      //     name: 'dev',
      //   },
      // })
      // ok2 && console.log('addSchema two ok')
    }, 1000 * 3)
  })
  .catch((e) => {
    clearTimeout(timer)
    timer = null

    console.error(e)
  })

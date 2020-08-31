import DAL, { DALOptions } from '@mrapi/dal'
// import { initialize } from 'express-openapi'
// import bodyParser from 'body-parser'
// import cors from 'cors'

const options: DALOptions = [
  {
    name: 'one',
    defaultTenant: {
      name: 'dev', // 视乎可以不要 name
      // url: 'file:../config/db/prod.db',
    },
  },
  {
    name: 'two',
    defaultTenant: {
      name: 'dev',
    },
  },
]

const app = new DAL(options)

let timer: any
app
  .start()
  .then(() => {
    // const thisApp = app.server.app
    // thisApp.use(cors())
    // thisApp.use(bodyParser.json())

    // initialize({
    //   validateApiDoc: false,
    //   app: thisApp,
    //   apiDoc: require('../api-v1/api-doc').default,
    //   docsPath: '/api-docs',
    //   operations: {
    //     queryUsers: function (req, res) {
    //       console.log('queryUsers')
    //       res.send('queryUsers test')
    //     },
    //   },
    //   // paths: path.resolve(__dirname, '../api-v1/api-routes'),
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

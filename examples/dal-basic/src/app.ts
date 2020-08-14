import DAL, { DALOptions } from '@mrapi/dal'
import path from 'path'

// import Context from './context'

const TEST_NAME = 'dev'

const options: DALOptions = [
  {
    name: TEST_NAME,
    schema: {
      outputsDir: path.join(__dirname),
      schemaDir: require.resolve('./schema'),
      // contextSource: require.resolve('./context'),
    },
    // graphqlHTTP: {
    //   context: Context(),
    // },
  },
]

const app = new DAL(options)

app
  .start()
  .then(() => {
    setTimeout(() => {
      // // stop test
      // app.stop().then(() => console.log('stop'))
      // // removeSchema test
      // const ok = app.removeSchema(TEST_NAME)
      // ok && console.log('removeSchema ' + TEST_NAME)
      // // addSchema test
      // const ok2 = app.addSchema('devThree', {
      //   schema: {
      //     outputsDir: path.join(__dirname),
      //     schemaDir: require.resolve('./schema'),
      //     contextSource: require.resolve('./context'),
      //   },
      //   graphqlHTTP: {
      //     context: new Context(),
      //   },
      // })
      // ok2 && console.log('addSchema ok')
    }, 1000 * 3)
  })
  .catch((e) => {
    console.error(e)
  })

import { buildSchema } from 'graphql'
import { graphqlHTTP } from 'express-graphql'
import { App, HTTPVersion } from '@mrapi/app'

const app = new App<HTTPVersion.V2>()

const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

const rootValue = {
  hello: () => 'Hello world!',
}

const extensions = ({ context }: any) => {
  return {
    runTime: Date.now() - context.startTime,
  }
}

app
  .get(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue,
      graphiql: {
        defaultQuery: `{
  hello
}
`,
        headerEditorEnabled: true,
      },
    }),
  )
  .post(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue,
      extensions,
      context: { startTime: Date.now() },
    }),
  )
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

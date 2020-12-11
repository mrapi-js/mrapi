import { App } from '@mrapi/app'
import { json } from 'body-parser'
import { graphql, buildSchema } from 'graphql'

const app = new App()

const tasks = [
  { id: 1, name: 'Go to Market', complete: false },
  { id: 2, name: 'Walk the dog', complete: true },
  { id: 3, name: 'Take a nap', complete: false },
]

const schema = buildSchema(`
	type Task {
		id: Int!
		name: String!
		complete: Boolean!
	}

	type Query {
		tasks: [Task]
		task(id: Int!): Task
	}
`)

let ctx = {
  tasks: () => tasks,
  task: (args: any) => tasks.find((o) => o.id === args.id),
}

app
  .use(json())
  .post('/', (req, res) => {
    const { query } = req.body as any
    graphql(schema, query, ctx).then((data: any) => {
      res.send(data)
    })
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

import { buildSchema } from 'graphql'
import { graphqlMiddleware } from '../src/index'
import { defaultErrorFormatter } from '../src/error'
import { getRequestParams } from '../src/param'
import { App } from '@mrapi/app'
import http from 'http' 
// import { getOperationsMap } from '../src/utils'
// import { validateQuery } from '../src/validate'

describe('graphql', () => {
  test('types', () => {
    expect(typeof graphqlMiddleware).toBe('function')
  })
  test('graphqlMiddleware error', () => {
    expect(typeof defaultErrorFormatter).toBe('function')
    const error = defaultErrorFormatter({
      res: '' as any,
      req: '' as any,
      error: 'err',
    })
    expect(error).toBeDefined()
  })

  test('graphql param', () => {
    expect(typeof getRequestParams).toBe('function')
    try {
      const req1 = {
        body: {
          query: 'cyrus',
          variables: '',
          operationName: 'cyrus',
        },
      }
      getRequestParams(req1 as any)
    } catch (error) {
      expect(error.message).toBe('Variables are invalid JSON.')
    }
    try {
      const req2 = {
        body: {
          query: 'cyrus',
          variables: '{"name": "cyrus"}',
          operationName: 'cyrus',
        },
      }
      const { query, variables, operationName } = getRequestParams(req2 as any)
      expect(query).toBe('cyrus')
      expect(variables).toEqual({ name: 'cyrus' })
      expect(operationName).toBe('cyrus')
    } catch (error) {
      expect(error).toBe('Variables are invalid JSON.')
    }
    try {
      const req3 = {
        body: undefined,
      }
      getRequestParams(req3 as any)
    } catch (error) {
      expect(error.message).toBe('No param found')
    }
    try {
      const req4 = {
        body: {
          query: 'cyrus',
          variables: '{"name": "cyrus"}',
          operationName: {},
        },
      }
      const { query, variables, operationName } = getRequestParams(req4 as any)
      expect(query).toBe('cyrus')
      expect(variables).toEqual({ name: 'cyrus' })
      expect(operationName).toBeNull()
    } catch (error) {
      expect(error).toBe('Variables are invalid JSON.')
    }
  })

  // test('graphqlMiddleware utils', () => {
  //   expect(typeof getOperationsMap).toBe('function')
  //   getOperationsMap()
  //   expect(error).toBeDefined()
  // })
  // test('graphqlMiddleware validate', () => {
  //   expect(typeof validateQuery).toBe('function')
  // })
  test('graphql method error', async () => {
    try {
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
      const req1 = {
        method: 'put',
      }
      const res1 = {
        code: 0,
        message: '',
        send: function (message: string) {
          this.message = message
          return this
        },
        status: function (code: number) {
          this.code = code
          return this
        },
      }
      const fn = graphqlMiddleware({ schema: schema })
      expect(typeof fn).toBe('function')
      const res: any = await fn(req1 as any, res1 as any)
      expect(res.code).toBe(405)
      expect(res['message']).toBe(
        'GraphQL only supports GET and POST requests.',
      )
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
  test('graphql query error', async () => {
    try {
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
      const req2 = {
        method: 'GET',
        body: {
          query: null,
          variables: '{"name": "cyrus"}',
          operationName: 'cyrus',
        },
      }
      const res2 = {
        code: 0,
        message: '',
        send: function (message: string) {
          this.message = message
          return this
        },
        status: function (code: number) {
          this.code = code
          return this
        },
      }
      const fn = graphqlMiddleware({ schema: schema })
      expect(typeof fn).toBe('function')
      const res: any = await fn(req2 as any, res2 as any)
      expect(res['code']).toBe(400)
      expect(res['message']).toBe('Invalid GraphQL query')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
  test('graphql query syntax error', async () => {
    try {
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
      const req3 = {
        method: 'GET',
        body: {
          query: 'cyrus',
          variables: '{"name": "cyrus"}',
          operationName: 'cyrus',
        },
      }
      const res3 = {
        code: 0,
        message: '',
        send: function (message: string) {
          this.message = message
          return this
        },
        status: function (code: number) {
          this.code = code
          return this
        },
      }
      const fn = graphqlMiddleware({ schema: schema })
      expect(typeof fn).toBe('function')
      const res: any = await fn(req3 as any, res3 as any)
      expect(res['code']).toBe(400)
      expect(res['message']).toBe(
        'GraphQL query syntax error: Syntax Error: Unexpected Name "cyrus".',
      )
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
  test('graphql field not found', async () => {
    try {
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
      const req4 = {
        method: 'GET',
        body: {
          query:
            'query fetchObjectData {\n  fetchObjectData(\n    isReturn: true\n  ) {\n    id\n    username\n    age\n    height\n    isMarried\n  }\n}\n\nmutation updateData {\n  updateData(\n    num: 2\n  )\n}',
          variables: '{"name": "cyrus"}',
          operationName: 'cyrus',
        },
      }
      const res4 = {
        code: 0,
        message: '',
        send: function (message: string) {
          this.message = message
          return this
        },
        status: function (code: number) {
          this.code = code
          return this
        },
      }
      const fn = graphqlMiddleware({ schema: schema })
      expect(typeof fn).toBe('function')
      const res: any = await fn(req4 as any, res4 as any)
      expect(res['code']).toBe(400)
      expect(res['message']).toBe(
        'GraphQL query syntax error: Syntax Error: Unexpected Name "cyrus".',
      )
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  test('graphql', async () => {
    try {
      const app = new App()
      const options = {
        schema: require('./shema'), // graphql 实例
        formatError: (error: any) => ({
          // 捕获所有graphql中的异常错误并加以处理
          message: error.message,
          locations: error.locations,
          stack: error.stack ? error.stack.split('\n') : [],
          path: error.path,
        }),
        extensions: () => {
          return {
            runTime: Date.now()
          }
        }
      }
      await app.use('/graphql', graphqlMiddleware(options))
      await app.listen(3000, () => {
        console.log("graphql server is ok");
      });
      function httpReq () {
        return new Promise(resolve => {
          http.get(`http://127.0.0.1:3000/graphql?query=query fetchObjectData {\n  fetchObjectData(\n    isReturn: true\n  ) {\n    id\n    username\n    age\n    height\n    isMarried}}`, res => {
            let body = ''
            res.on('data', data => {
              body += data
            })
            res.on('end', () => {
              resolve(body)
            })
          })
        })
      }
      const res = await httpReq()
      await app.close()
      const a = JSON.parse(res as any)
      expect(a.data).toBeDefined()
      expect(a.extensions).toBeDefined()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

})

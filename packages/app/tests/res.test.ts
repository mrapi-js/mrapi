import path from 'path'
import { App } from '../src/index'
import http from 'http'
import { send } from '../src/res'

const configPath = path.join(__dirname, '__fixtures__/config/mrapi.config.js')
const config = require(configPath)
let apptest: App = new App(config)

describe('res', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterAll(() => {
    apptest.close()
  })

  test('case string', async () => {
    apptest.listen(3030)
    apptest.get('/foo', (req, res) => {
      send(req, res, 'foo')
    })
    apptest.get('/foo2', (req, res) => {
      res.status(204)
      send(req, res)
    })
    apptest.head('/head', (req, res) => {
      send(req, res)
    })
    apptest.get('/user', (req, res) => {
      send(req, res, { name: 'leo' })
    })
    apptest.get('/user2', (req, res) => {
      send(req, res, null)
    })
    // apptest.get('/buffer', (req, res) => {
    //   send(req, res, Buffer.from([], 10, 10))
    // })
    // send string
    function httpReq() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('foo')
            resolve(body)
          })
        })
      })
    }
    await httpReq()
    // status code 204/304
    function httpReq2() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo2', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('')
            resolve(body)
          })
        })
      })
    }
    await httpReq2()
    // // send head
    function httpReq3() {
      return new Promise((resolve) => {
        http.get(
          'http://127.0.0.1:3030/head',
          {
            method: 'head',
          },
          (res) => {
            let body = ''
            res.on('data', (data) => {
              body += data
            })
            res.on('end', () => {
              expect(body).toBe('')
              resolve(body)
            })
          },
        )
      })
    }
    await httpReq3()
    // data
    function httpReq4() {
      return new Promise((resolve) => {
        http.get(
          'http://127.0.0.1:3030/user',
          {
            method: 'get',
          },
          (res) => {
            let body = ''
            res.on('data', (data) => {
              body += data
            })
            res.on('end', () => {
              expect(body).toBe('{"name":"leo"}')
              resolve(body)
            })
          },
        )
      })
    }
    await httpReq4()
    // data null
    function httpReq5() {
      return new Promise((resolve) => {
        http.get(
          'http://127.0.0.1:3030/user2',
          {
            method: 'get',
          },
          (res) => {
            let body = ''
            res.on('data', (data) => {
              body += data
            })
            res.on('end', () => {
              expect(body).toBe('')
              resolve(body)
            })
          },
        )
      })
    }
    await httpReq5()
    // data buffer
    // function httpReq6 () {
    //   return new Promise(resolve => {
    //     http.get(
    //       'http://127.0.0.1:3030/buffer',
    //       {
    //         method: 'get',
    //       },
    //       res => {
    //         let body = ''
    //         res.on('data', data => {
    //           body += data
    //         })
    //         res.on('end', () => {
    //           expect(body).toBe('')
    //           resolve(body)
    //         })
    //       },
    //     )
    //   })
    // }
    // await httpReq6()
  })
})

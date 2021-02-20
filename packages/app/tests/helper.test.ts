import path from 'path'
import { defaultRoute, errorHandler, next } from '../src/helper'
import { App } from '../src/index'
import http from 'http'
import { Middleware } from '../src/types'

const configPath = path.join(__dirname, '__fixtures__/config/mrapi.config.js')
const config = require(configPath)

describe('helper', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterAll(() => {
    // apptest.close()
  })

  test('errorHandler', async () => {
    let apptest: App = new App(config)
    apptest.listen(3030)
    apptest.get('/foo', (req, res) => {
      errorHandler('leo hack', req, res)
    })
    apptest.get('/foo2', (req, res) => {
      errorHandler({ message: 'leo hack2' }, req, res)
    })
    function httpReq() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('leo hack')
            resolve(body)
          })
        })
      })
    }
    await httpReq()
    function httpReq2() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo2', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('leo hack2')
            resolve(body)
          })
        })
      })
    }
    await httpReq2()
    await apptest.close()
  })

  test('defaultRoute', async () => {
    const app: App = new App(config)
    app.listen(3030)
    app.get('/foo', (req, res) => {
      defaultRoute(req, res)
    })
    function httpReq() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('Not Found')
            resolve(body)
          })
        })
      })
    }
    await httpReq()
    await app.close()
  })

  test('next & step', async () => {
    const app: App = new App(config)
    const midapp: Middleware = new App(config)
    app.listen(3030)
    app.get('/foo', (req, res) => {
      next([midapp, midapp], req, res, 0, errorHandler)
    })
    app.get('/foo2', (req, res) => {
      next([], req, res, 0, errorHandler)
    })
    function httpReq() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('Not Found')
            resolve(body)
          })
        })
      })
    }
    await httpReq()
    function httpReq2() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/foo2', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            expect(body).toBe('Not Found')
            resolve(body)
          })
        })
      })
    }
    await httpReq2()
    await app.close()
  })
})

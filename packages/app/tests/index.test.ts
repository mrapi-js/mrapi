import path from 'path'
import { App } from '../src/index'
import http from 'http'
import { errorHandler, next } from '../src/helper'
const configPath = path.join(__dirname, '__fixtures__/config/mrapi.config.js')
const config = require(configPath)
let apptest: App = new App(config)

describe('index', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterAll(() => {
    apptest.close()
  })

  test('app', () => {
    expect(typeof apptest).toBe('object')
  })

  test('app option', () => {
    expect(typeof apptest.defaultRoute).toBe('function')
    expect(typeof apptest.errorHandler).toBe('function')
    expect(typeof apptest.logger.level).toBe('string')
    expect(typeof apptest.parse).toBe('function')
    expect(apptest.routes instanceof Array).toBe(true)
  })

  test('app lookup', async () => {
    expect(typeof apptest.lookup).toBe('function')
    const subApp = new App(config)
    subApp.get('/foo', (req, res) => {
      res.end(`hello from foo! ${req.query ? 11 : 22}`)
    })
    apptest.use('/v1', subApp).listen(3030, () => {})
    function httpReq() {
      return new Promise((resolve) => {
        http.get('http://127.0.0.1:3030/v1/foo', (res) => {
          let body = ''
          res.on('data', (data) => {
            body += data
          })
          res.on('end', () => {
            resolve(body)
          })
        })
      })
    }
    const body = await httpReq()
    expect(body).toBe('hello from foo! 11')
    // listen
    const apphttp2 = new App({ http2: true })
    expect(() => {
      apphttp2.listen(3031, { http2: true })
    }).toThrow()

    const apptest2 = new App({
      http2: true,
      https: {},
    })
    apptest2.listen(3032)
    // close
    apptest2.close()
  })

  test('close error', async () => {
    const apptest2 = new App({
      http2: true,
      https: {},
    })
    apptest2.listen(3032)
    const tmp = apptest2.server
    apptest2.server = undefined
    // close
    try {
      await apptest2.close()
    } catch (error) {
      expect(error).toBe('server not started')
      apptest2.server = tmp
      apptest2.close()
    }
  })

  test('lookup step', async () => {
    const apptest2 = new App(config)
    apptest2.listen(3032)
    apptest2.get('/step', (req, res) => {
      next([apptest], req, res, 1, errorHandler)
    })
    function httpReq() {
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
    await httpReq()
    await apptest2.close()
  })
})

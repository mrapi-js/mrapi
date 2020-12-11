import pem from 'pem'
import { json } from 'body-parser'
import cookieParser from 'cookie-parser'

import { App } from '../src/index'

let app: App

describe('App Basic', () => {
  beforeEach(() => {
    app = new App()
  })

  afterEach(() => {
    ;(app as any) = undefined
  })

  test('types', () => {
    expect(typeof App).toBe('function')
    expect(typeof app).toBe('object')
    ;[
      'parse',
      'lookup',
      'listen',
      'defaultRoute',
      'errorHandler',
      'use',
      'on',
      'off',
      'find',
    ].forEach((k) => {
      expect(typeof (app as any)[k]).toBe('function')
    })

    expect(typeof app.routes).toBe('object')
  })

  test('listen', () => {
    const out = app.listen(3000)
    expect(out).toBe(app)
    expect(app.server).toBeDefined()
    expect(typeof app.server?.address).toBe('function')
    app.close()
  })

  test('routes basic', () => {
    app.get('/one', (_req, res) => {
      res.end('one')
    })

    app.listen(3000)
    expect(app.find('GET', '/one').handlers.length).toBe(1)

    app.close()
  })

  test('middleware', () => {
    app
      .use(async (_req, _res, next) => {
        await next()
      })
      .use(async (_req, _res, next) => {
        await next()
      })
      .use('/users/1', async (_req, _res, next) => {
        await next()
      })
      .get('/users/:id?', (req, res) => {
        res.end(`users ${req.params.id}`)
      })
      .listen(3000)

    expect(app.find('GET', '/users/1').handlers.length).toBe(4)
    expect(app.find('GET', '/users/2').handlers.length).toBe(3)

    app.close()
  })

  test('express middleware', () => {
    app
      .use(json())
      .use(cookieParser())
      .get('/', (req, res) => {
        expect(req.cookies).toEqual({})
        res.end('')
      })
      .listen(3000)

    expect(app.find('GET', '/').handlers.length).toBe(3)
    // TODO: request

    app.close()
  })

  test('http2', () => {
    pem.createCertificate(
      {
        days: 1,
        selfSigned: true,
      },
      (err, keys) => {
        if (err) {
          throw err
        }

        const app2 = new App({
          http2: true,
          https: {
            key: keys.serviceKey,
            cert: keys.certificate,
          },
        })
          .get('/', (_req, res) => {
            res.end('Hello World!')
          })
          .listen(3000)

        expect(app2.find('GET', '/').handlers.length).toBe(1)
        // TODO: request

        app2.close()
      },
    )
  })

  test('nested', () => {
    app.get('/', (_req, res) => {
      res.end('')
    })

    const appMain = new App()
    appMain.use('/v1', app).listen(3000)

    expect(appMain.find('GET', '/v1').handlers.length).toBe(1)
    // TODO: request

    appMain.close()
  })
})

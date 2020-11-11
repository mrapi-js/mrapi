import { App } from '@mrapi/app'
import { Service } from '../'

describe('Service', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('types', () => {
    expect(typeof Service).toBe('function')

    const service = new Service()
    const { app } = service
    expect(typeof service).toBe('object')
    expect(service).toBeInstanceOf(Service)
    expect(app).toBeInstanceOf(App)
    ;[
      // App
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
    ;[
      // Service
      'start',
      'logEndpoints',
    ].forEach((k) => {
      expect(typeof (service as any)[k]).toBe('function')
    })
    ;['endpoints'].forEach((k) => {
      expect(Array.isArray((service as any)[k])).toBeTruthy()
    })
  })

  test('middleware', () => {
    const service = new Service()
    const { app } = service
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

    // 'body-parser' middleware id added by default
    expect(app.find('GET', '/users/1').handlers.length).toBe(5)
    expect(app.find('GET', '/users/2').handlers.length).toBe(4)

    app.close()
  })
})

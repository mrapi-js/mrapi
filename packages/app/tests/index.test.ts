import Ajax from './__fixtures__/axios'
import { App } from '../src/index'
import defaultApp from '../src/index'
import {
  noPortApp,
  http2ErrorApp,
  middlewareApp,
} from './__fixtures__/app-demo/index'
const ajax = new Ajax()
const NO_PORT_URL = 'http://localhost:1358'
describe('no-port-app', () => {
  beforeEach(() => {})

  afterEach(() => {})
  beforeAll(() => {
    const out = noPortApp.listen()
    expect(out).toBe(noPortApp)
  })
  afterAll(() => {
    noPortApp.close()
  })
  test('test app.cache', () => {
    const cacheApp = new App({ cache: 3000 })
    expect(typeof cacheApp.cache).toBe('object')
  })

  test('listen()  params ', () => {
    // port=undefined
    return ajax
      .get(`${NO_PORT_URL}/user`)
      .then((res) => {
        expect(res.data).toEqual({ user: 'clik' })
      })
      .catch((err) => {
        expect(typeof err).toBe('object')
      })
  })
  test('use() Reg', () => {
    noPortApp.use(/\/test/, async (_req, _res, next) => {
      console.log(1)
      await next()
    })
  })
  test('lookup() error', () => {
    const app = new App()
    const nullParams: any = {}
    try {
      app.lookup(nullParams, nullParams, '')
    } catch (error) {
      expect(error.message).toContain('error')
    }
  })
  test('lookup()  fns instanceof App', () => {
    return ajax
      .get(`${NO_PORT_URL}/test`)
      .then((res) => {
        expect(res.data).toBe('test empty')
      })
      .catch((err) => {
        expect(typeof err).toBe('object')
      })
  })

  test('GET /v1/child', () => {
    return ajax
      .get(`${NO_PORT_URL}/v1/sub`)
      .then((res) => {
        expect(res.data).toBe('test sub')
        expect(middlewareApp.prefix).toBe('/v1')
        expect(noPortApp.find('GET', '/v1').handlers.length).toBe(1)
      })
      .catch((err) => {
        expect(typeof err).toBe('object')
      })
  })
  test('GET /foo/:id', () => {
    return ajax
      .get(`${NO_PORT_URL}/foo/2`)
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  })
})
describe('error App', () => {
  test('listen()', () => {
    try {
      http2ErrorApp.listen()
    } catch (error) {
      expect(error.message).toContain(
        "please config http2 in 'http2' or 'https' field",
      )
    }
  })
  test('close() error', () => {
    return http2ErrorApp
      .close()
      .then((res) => {
        console.log(res)
      })
      .catch((error) => {
        expect(error).toContain('server not started')
      })
  })
  test('close() error', () => {
    // const closeErrorApp=new App()
    // closeErrorApp.listen(3002)
    // closeErrorApp.close()
  })
  test('app opts is null', () => {
    const options: any = null
    const nullOptionsApp = new App(options)
    expect(nullOptionsApp).toBeInstanceOf(App)
    expect(nullOptionsApp).toBeTruthy()
    expect(typeof nullOptionsApp.id).toBe('string')
  })
})
describe('defaultApp', () => {
  test('export default', () => {
    const app = defaultApp({})
    expect(app).toBeInstanceOf(App)
  })
})

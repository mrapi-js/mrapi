import { Router } from '../'

const fn = () => {}
const fn1 = (x: any, y: any) => x + y
const fn2 = (x: any, y: any, z: any) => x + y + z

describe('Router Basic', () => {
  test('types', () => {
    const router = new Router()
    expect(typeof Router).toBe('function')
    expect(typeof router).toBe('object')
    ;['use', 'on', 'off', 'find', 'all'].forEach((k) => {
      expect(typeof (router as any)[k as string]).toBe('function')
    })
    expect(typeof router.routes).toBe('object')
  })

  test('on()', () => {
    const router = new Router()
    const out = router.on('GET', '/foo/:hello', fn)
    expect(out).toEqual(router)
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].method).toBe('GET')
    expect(router.routes[0].keys).toEqual(['hello'])

    router.post('bar', fn)
    expect(router.routes.length).toBe(2)
    expect(router.routes[1].method).toBe('POST')

    router.on('PUT', /^[/]foo[/](?<hello>\w+)[/]?$/, fn)
    expect(router.routes.length).toBe(3)
    expect(router.routes[2].pattern.test('/foo/bar')).toBeTruthy()
  })

  test('on() multiple', () => {
    const router = new Router()
    const out = router.on('GET', '/foo/:hello', [fn, fn])
    expect(out).toEqual(router)
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].method).toBe('GET')
    expect(router.routes[0].keys).toEqual(['hello'])

    router.post('/bar', fn, fn, fn)
    expect(router.routes.length).toBe(2)
    expect(router.routes[1].method).toBe('POST')
  })

  test('off()', () => {
    const router = new Router()

    router.on('GET', '/foo/:hello', [fn1, fn2])
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].handlers.length).toBe(2)

    const out = router.off('GET', '/foo/:hello', fn1)
    expect(out).toEqual(router)
    expect(router.routes[0].handlers.length).toBe(1)

    router.off('GET', '/foo/:hello')
    expect(router.routes.length).toBe(0)
  })

  test('use()', () => {
    const router = new Router()

    const out = router.use('/foo/:hello', fn)
    expect(out).toEqual(router)
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].method).toBe('')
    expect(router.routes[0].keys).toEqual(['hello'])

    router.use('/', [fn, fn, fn])
    expect(router.routes.length).toBe(2)
    expect(router.routes[1].method).toBe('')
    expect(router.routes[1].keys).toEqual([])
    expect(router.routes[1].handlers.length).toBe(3)
    expect(router.routes[1].pattern.test('/')).toBeTruthy()

    router.use('/foo/:world?', fn, [fn, fn, fn], fn)
    expect(router.routes.length).toBe(3)
    expect(router.routes[2].method).toBe('')
    expect(router.routes[2].keys).toEqual(['world'])
    expect(router.routes[2].handlers.length).toBe(5)
    expect(router.routes[2].pattern.test('/foo/hello')).toBeTruthy()
  })

  test('all()', () => {
    const router = new Router()

    router.all('/foo/:name', (req: any) => req.chain++)
    expect(router.routes.length).toBe(1)

    const head = router.find('HEAD', '/foo/bob')
    expect(head.params.name).toBe('bob')
    expect(head.handlers.length).toBe(1)
    const req = {
      chain: 0,
    }
    head.handlers.forEach((f) => f(req))
    expect(req.chain).toBe(1)

    const get = router.find('GET', '/foo/bob')
    expect(get.params.name).toBe('bob')
    expect(get.handlers.length).toBe(1)
    const req2 = {
      chain: 0,
    }
    get.handlers.forEach((f) => f(req2))
    expect(req.chain).toBe(1)

    const post = router.find('POST', '/foo/bob')
    expect(post.params.name).toBe('bob')
    expect(post.handlers.length).toBe(1)
    const req3 = {
      chain: 0,
    }
    post.handlers.forEach((f) => f(req3))
    expect(req.chain).toBe(1)
  })

  test('find()', () => {
    const router = new Router()

    router.get(
      '/foo/:title',
      (req: any) => {
        expect(req.chain++).toBe(1)
        expect(req.params.title).toBe('bar')
      },
      (req: any) => {
        expect(req.chain++).toBe(2)
      },
    )

    const out = router.find('GET', '/foo/bar')
    expect(typeof out).toBe('object')
    expect(out.handlers.length).toBe(2)
    expect(typeof out.params).toBe('object')
    expect(out.params.title).toBe('bar')
    ;(out as any).chain = 1
    out.handlers.forEach((f) => f(out))
    expect((out as any).chain).toBe(3)
  })

  test('find() multiple', () => {
    const router = new Router()
    router
      .use('/foo', (req: any) => {
        isRoot || expect(req.params.title).toBe('bar')
        expect(req.chain++).toBe(0)
      })
      .get('/foo', (req: any) => {
        expect(req.chain++).toBe(1)
      })
      .get('/foo/:title?', (req: any) => {
        isRoot || expect(req.params.title).toBe('bar')
        isRoot ? expect(req.chain++).toBe(2) : expect(req.chain++).toBe(1)
      })
      .get('/foo/*', (req: any) => {
        expect(req.params.wild).toBe('bar')
        expect(req.params.title).toBe('bar')
        expect(req.chain++).toBe(2)
      })

    let isRoot = true
    let foo = router.find('GET', '/foo')
    expect(foo.handlers.length).toBe(3)
    ;(foo as any).chain = 0
    foo.handlers.forEach((f) => f(foo))

    isRoot = false
    let bar = router.find('GET', '/foo/bar')
    expect(foo.handlers.length).toBe(3)
    ;(bar as any).chain = 0
    bar.handlers.forEach((f) => f(bar))
  })

  test('find() no match', () => {
    const router = new Router()

    const out = router.find('DELETE', '/nothing')
    expect(typeof out).toBe('object')
    expect(out.params).toEqual({})
    expect(out.handlers.length).toBe(0)
  })

  test('find() w/ all()', () => {
    const r1 = new Router().all('api', fn)
    const r2 = new Router().all('api/:version', fn)
    const r3 = new Router().all('api/:version?', fn)

    expect(r1.find('GET', '/api').handlers.length).toBe(1)
    expect(r1.find('GET', '/api/v1').handlers.length).toBe(0)

    const t2 = r2.find('GET', '/api/v1')
    expect(t2.handlers.length).toBe(1)
    expect(t2.params.version).toBe('v1')
    const t21 = r2.find('GET', '/api/v1/users')
    expect(t21.handlers.length).toBe(0)
    expect(t21.params.version).toBe(undefined)

    expect(r3.find('GET', '/api').handlers.length).toBe(1)
    const t3 = r3.find('GET', '/api/v1')
    expect(t3.handlers.length).toBe(1)
    expect(t3.params.version).toBe('v1')
    const t31 = r3.find('GET', '/api/v1/users')
    expect(t31.handlers.length).toBe(0)
    expect(t31.params.version).toBe(undefined)
  })

  test('find() w/ use() loose match', () => {
    const r1 = new Router().use('api', fn)
    const r2 = new Router().use('api/:version', fn)
    const r3 = new Router().use('api/:version?', fn)

    expect(r1.find('GET', '/api').handlers.length).toBe(1)
    expect(r1.find('GET', '/api/v1').handlers.length).toBe(1)

    const t2 = r2.find('GET', '/api/v1')
    expect(t2.handlers.length).toBe(1)
    expect(t2.params.version).toBe('v1')
    const t21 = r2.find('GET', '/api/v1/users')
    expect(t21.handlers.length).toBe(1)
    expect(t21.params.version).toBe('v1')

    expect(r3.find('GET', '/api').handlers.length).toBe(1)
    const t3 = r3.find('GET', '/api/v1')
    expect(t3.handlers.length).toBe(1)
    expect(t3.params.version).toBe('v1')
    const t31 = r3.find('GET', '/api/v1/users')
    expect(t31.handlers.length).toBe(1)
    expect(t31.params.version).toBe('v1')
  })
})

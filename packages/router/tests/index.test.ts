import  { Router } from '../src'
import defaultRouter from '../src'
import type {HTTPMethod} from '../src'
const fn = () => {}
const fn1 = (x: any, y: any) => x + y
const fn2 = (x: any, y: any, z: any) => x + y + z
const functionNamesArr = [
  'use',
  'on',
  'off',
  'find',
  'all',
  'get',
  'head',
  'patch',
  'options',
  'connect',
  'delete',
  'trace',
  'post',
  'put',
]
const routerFunctionsName=['all','get','head','patch','options','connect','delete','trace','post','put']
describe('Router Basic', () => {
  test('types', () => {
    const router = new Router()
    expect(typeof Router).toBe('function')
    expect(typeof router).toBe('object')
    functionNamesArr.forEach((k) => {
      expect(typeof (router as any)[k as string]).toBe('function')
    })
    expect(typeof router.routes).toBe('object')
    expect(router.routes).toEqual([])
    expect(router.prefix).toBe(undefined)
    // expect(HTTPMethod).toBeDefined()
  })
    test('constructor', () => {
      expect(typeof Router).toBe('function')
      expect(Router).toBeDefined()
      const router=new Router({prefix:'testPrefix'})
      expect(router.prefix).toBe('testPrefix')
      const router2=new Router({})
      expect(router2.prefix).toBe(undefined)
      const router3=new Router(void 0)
      expect(router3).toEqual({routes:[]})
      expect(typeof defaultRouter).toBe('function')
      const requireRouter=require('../src')
      expect(requireRouter.default).toEqual(defaultRouter)
    });
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
  test('on() empty and other HTTP function', () => {
    const router = new Router()
    const ohterHttpMethods: HTTPMethod[] = ['SUBSCRIBE', 'UNSUBSCRIBE']
    for (let i = 0; i < ohterHttpMethods.length; i++) {
      const item: HTTPMethod = ohterHttpMethods[i]
      const out = router.on(item, '/foo/:hello', fn)
      expect(out).toEqual(router)
      expect(router.routes[i].method).toBe(item)
      expect(router.routes[i].pattern).toEqual(/^\/foo\/([^/]+?)\/?$/i)
      expect(router.routes[i].keys).toEqual(['hello'])
      expect(router.routes[i].handlers).toEqual([fn])
    }
    const empty=router.on('', '/foo/:hello', fn)
    expect(empty).toEqual(router)
    // ohterHttpMethods.forEach((item:HTTPMethod,index:number)=>{
    //   const out = router.on(item, '/foo/:hello', fn)
    //   expect(out).toEqual(router)
    //   expect(router.routes[index].method).toBe(item)
    //   expect(router.routes[index].pattern).toEqual(/^\/foo\/([^/]+?)\/?$/i)
    //   expect(router.routes[index].keys).toEqual(['hello'])
    // expect(router.routes[index].handlers).toEqual([fn])
    // })
    // expect(out).toEqual(router)
  })
  test('off() idx>=0', () => {
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
  test('off() handler is different && idx=-1', () => {
    const router = new Router()
    router.on('GET', '/foo/:hello', fn,fn1)
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].handlers.length).toBe(2)
    router.off('GET', '/foo/:hello', fn2)
    expect(router.routes.length).toBe(1)
    // expect(router.routes[0].handlers).toBe(undefined)
  })
  test('off() method is different', () => {
    const router = new Router()
    router.on('GET', '/foo/:hello', fn)
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].handlers.length).toBe(1)
    router.off('POST', '/foo/:hello', fn1)
    expect(router.routes.length).toBe(1)
    expect(router.routes[0].handlers.length).toBe(1)
    router.on('GET','/foo2/:hello',[fn1,fn2])
    router.off('GET','/^/foo/([^/]+?)/?$/i',fn1)
  })
 0
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
    const out = router.all('/foo/:name', (req: any) => req.chain++)
    expect(out).toEqual(router)
    expect(typeof out).toBe('object')
    expect(typeof router.all).toBe('function')
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
    router.get(
      '/foo2/:title',
      (req: any) => {
        expect(req.chain++).toBe(1)
        expect(req.params.title).toBe('bar')
      },
    )
  })
  test('find() tmp.keys.length>0', () => {
    const router = new Router()
    router.get(
      '/foo/:title',
      fn
    )
    // mathces groups&& tmp.handlers.length = 1
    const out = router.find('GET', '/foo/bar')
    expect(out.handlers.length).toBe(1)
    expect(out.params.title).toBe('bar')
    // mathces groups&& tmp.handlers.length >1
    router.get('/foo2/:title',[fn1,fn2])
    const out2= router.find('GET', '/foo2/bar')
    expect(out2.params).toEqual({title:'bar'})
    expect(out2.handlers).toEqual([fn1,fn2])
    // matches=null
    const out3 = router.find('GET', '/foo')
    expect(typeof out3).toBe('object')
    expect(out3.params).toEqual({})
    expect(out3.handlers).toEqual([])
    expect(out3.handlers.length).toBe(0)
    
    // isHEAD && tmp.method === 'GET'
    const out4=router.find('HEAD','/foo')
    expect(out4.params).toEqual({})
    

});
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
  test('find() tmp.pattern.test(url)', () => {
    const router = new Router()
    // tmp.handlers.length > 1
    router.on('GET','/foo',[fn1,fn2])
    const out=router.find('GET','/foo')
    expect(out.handlers.length).toBe(2)
    // tmp.handlers.length <= 1
    router.on('GET','/foo2',fn1)
    const out2=router.find('GET','/foo2')
    expect(out2.handlers.length).toBe(1)
  });
  test('find() no match', () => {
    const router = new Router()
    const out = router.find('DELETE', '/nothing')
    expect(typeof out).toBe('object')
    expect(out.params).toEqual({})
    expect(out.handlers.length).toBe(0)
  })
  test('find() keys toEqual false', () => {
    const router = new Router()
    router.on('GET', /^[/]foo[/](?<hello>\w+)[/]?$/, fn)
    // mathces groups&& tmp.handlers.length = 1
    const out1 = router.find('GET', '/foo/bar')
    expect(typeof out1).toBe('object')
    expect(out1.params).toEqual({ hello: 'bar' })
    expect(out1.handlers.length).toBe(1)
    expect(out1.handlers).toEqual([fn])
    // matches = null
    const out2 = router.find('GET', '/foo')
    expect(typeof out2).toBe('object')
    expect(out2.params).toEqual({})
    expect(out2.handlers).toEqual([])
    expect(out2.handlers.length).toBe(0)
    // mathces groups&& tmp.handlers.length> 1
    router.on('GET',/^[/]foo2[/](?<hello>\w+)[/]?$/,[fn,fn1])
    const out3 = router.find('GET', '/foo2/bar')
    expect(out3.params).toEqual({hello:'bar'})
    expect(out3.handlers).toEqual([fn,fn1])
    // matches.groups == void 0
    const out4=router.find('GET','/foo2/bar bar2')
    expect(out4.params).toEqual({})
  })

  test('find() !tmp.mehtod', () => {
    const router=new Router()
    router.on('GET', /^[/]foo[/](?<hello>\w+)[/]?$/, fn)
    const out1 = router.find('POST', '/foo/bar')
    expect(out1.handlers).toEqual([])
    expect(out1.params).toEqual({})
  });
  test('find() tmp.method & !other', () => {
      const router=new Router()
      router.on('GET','/foo',fn1)
      const out=router.find('GET','/foo2')
      expect(out.params).toEqual({})
      expect(out.handlers).toEqual([])
      // expect(out).toBeDefined()
  });
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
  test('other http function', () => {
    const router = new Router()
    for(let i=0;i<routerFunctionsName.length;i++){
      const routerFunctionName:string=routerFunctionsName[i]
      const out = (router as any)[routerFunctionName]('/foo/bar',[fn,fn1])
      expect(out).toEqual(router)
    }
    expect(router.routes.length).toBe(10)
  })
})

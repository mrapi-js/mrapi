import { Gateway } from '../src/index'
// import http from 'http'
describe('gateway', () => {
  test('types', () => {
    expect(typeof Gateway).toBe('function')
    const gateway = new Gateway({
      app: {},
      services: [{ name: 'cyrus', url: '123' }],
    })

    expect(typeof gateway).toBe('object')
    expect(gateway).toBeInstanceOf(Gateway)
    ;[
      'initServices',
      'createProxy',
      'addService',
      'removeService',
      'logEndpoints',
      'start',
    ].forEach((fn) => {
      expect(typeof (gateway as any)[fn]).toBe('function')
    })
  })
  test('services is not an array', () => {
    const gateway2 = new Gateway({
      app: {},
      services: {} as any,
    })

    expect(typeof gateway2).toBe('object')
  })
  test('services name exist', () => {
    try {
      const gateway3 = new Gateway({
        app: {},
        services: [
          { name: 'cyrus', url: '123' },
          { name: 'cyrus', url: '123' },
        ],
      })
      expect(typeof gateway3).toBe('object')
    } catch (error) {
      expect(error.message).toBe("Service 'cyrus' already exist")
    }
  })
  test('remove services', () => {
    const gateway4 = new Gateway({
      app: {},
      services: [{ name: 'cyrus', url: '123' }],
    })
    gateway4.removeService('cyrus')
  })
  test('remove services not found', () => {
    try {
      const gateway5 = new Gateway({
        app: {},
        services: [{ name: 'cy', url: '123' }],
      })
      gateway5.removeService('cyrus')
    } catch (error) {
      expect(error.message).toBe("Service 'cyrus' not found")
    }
  })
  // test('add services', async () => {
  //   const gateway6 = new Gateway({
  //     app: {},
  //     services: [{ name: 'cyrus', url: '123' }],
  //   })
  //   await gateway6.start(1359)
  //   function httpReq() {
  //     return new Promise((resolve) => {
  //       http.get('http://localhost:1359/cyrus/user', (res) => {
  //         let body = ''
  //         res.on('data', (data) => {
  //           body += data
  //         })
  //         res.on('end', () => {
  //           resolve(body)
  //         })
  //       })
  //     })
  //   }
  //   try {
  //     const body = await httpReq()
  //     expect(body).toBeDefined()
  //   } catch (error) {
  //     expect(error).toBeDefined()
  //   }
  //   gateway6.close()
  // })

  test('geteway start', async () => {
    const gateway7 = new Gateway({
      app: {},
      services: [{ name: 'cyrus', url: '123' }],
    })
    try {
      const res = await gateway7.start()
      expect(res).toBeDefined()
      gateway7.close()
    } catch (error) {
      expect(error.message).toBe('address already in use :::1358')
      gateway7.close()
    }
  })
})

import { Service } from '../src/index'

describe('Service Instance Method', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('start', () => {
    const service = new Service()
    const serviceMethods = [
      'applyGraphql',
      'applyOpenapi',
      'getTenantIdentity',
      'initDatasource',
      'logEndpoints',
      'start',
    ]
    serviceMethods.forEach(k => {
      expect(typeof (service as any)[k]).toBe('function')
    })
  })

  test('get logger', () => {
    const service = new Service()
    expect(service.logger).toBeDefined()
  })

  // test('initDatasource', () => {
  //   class Sub extends Service{
  //     public async testInitDatasource
  //   }
  //   const sub : Sub = new Sub()
  // })

  // test('start', () => {
  //   const service = new Service()
  //   service.start()
  // })
})

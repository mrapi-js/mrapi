import { Service } from '../src/index'
describe('Service Instance Method', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('start', async () => {
    const service = new Service()
    const serviceMethods = [
      'applyGraphql',
      'applyOpenapi',
      'getTenantIdentity',
      'initDatasource',
      'logEndpoints',
      'start',
    ]
    serviceMethods.forEach((k) => {
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
  test('start openapi', async () => {
    const service = new Service({
      service: {
        openapi: true,
        graphql: false,
      },
    })
    expect(await service.start(8080)).toEqual({
      address: '::',
      family: 'IPv6',
      port: 8080,
    })
  })
  test('start graphql', async () => {
    const service = new Service()
    expect(await service.start(8081)).toEqual({
      address: '::',
      family: 'IPv6',
      port: 8081,
    })
  })
  // test('start datasource', async () => {
  //   const service = new Service({
  //     service: {
  //       schema: 'prisma/schema.prisma',
  //       database: 'file:./dev.db',
  //     },
  //   })

  //   expect(await service.start(8082)).toEqual({})
  // })
})

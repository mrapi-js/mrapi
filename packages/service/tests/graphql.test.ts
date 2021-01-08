import { makeGraphqlServices } from '../src/graphql/index'
import { Service } from '../src/index'
describe('index', ()=>{
  test('makeGraphqlServices', async ()=> {
    const service = new Service()
    const getTenant = ()=>{}
    const endpoints = await makeGraphqlServices(service, getTenant)
    expect(endpoints).toBeDefined()
  })
})
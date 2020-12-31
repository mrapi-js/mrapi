import { getMeshSchema } from '../src/graphql/mesh'
import { Service } from '../src/index'
import { mrapi } from '@mrapi/service'
import {
  transform,
  resolverComposition,
  getGraphqlSchema,
  getOpenapiSchema,
} from '../src/graphql/mesh/tools'
import { getSchema } from '../src/graphql/schema/type-graphql'
describe('mesh', () => {
  const config: mrapi.PartialConfig = {
    service: {
      graphql: true,
      sources: [
        {
          name: 'auth',
          type: 'graphql',
          endpoint: 'https://covid-19.dava.engineer/api/graphql',
          prefixTransforms: {
            prefix: 'auth_',
            renameType: true,
            renameField: true,
            ignoreList: ['Query.cases'],
          },
        },
      ],
    },
    logger: {
      prettyPrint: true,
    },
  }
  test('getMeshSchema', async () => {
    expect(await getMeshSchema([])).toEqual(undefined)
  })

  test('mesh index', async () => {
    const service = new Service(config)
    try {
      const res = await service.start(9000)
      expect(res).toEqual({
        address: '::',
        family: 'IPv6',
        port: 9000,
      })
    } catch (error) {
      expect(error).toBe('address already in use :::9000')
    }
    await service.app.close()
  }, 10000)

  test('mesh tools', async () => {
    expect(typeof transform).toBe('function')
    expect(typeof resolverComposition).toBe('function')
    expect(typeof getGraphqlSchema).toBe('function')
    expect(typeof getOpenapiSchema).toBe('function')
    // openapi
    try {
      await getOpenapiSchema('http://www.baidu.com', {
        'Content-type': 'application/json',
      })
    } catch (error) {
      expect(error).toBe('mesh openapi support json source only ')
    }

    try {
      await getOpenapiSchema('https://covid-19.dava.engineer/api/graphql', {
        'Content-type': 'application/json',
      })
    } catch (error) {
      expect(error).toBe(
        'fetch https://covid-19.dava.engineer/api/graphql error 400',
      )
    }

    const openapiRes = await getOpenapiSchema(
      'https://api.apis.guru/v2/specs/mashape.com/geodb/1.0.0/swagger.json',
      {
        'Content-type': 'application/json',
      },
    )
    expect(typeof openapiRes).toBe('object')

    // graphql
    try {
      const graphqlRes = await getGraphqlSchema(
        'https://covid-19.dava.engineer/api/graphql',
        {
          'Content-type': 'application/json',
        },
      )
      expect(typeof graphqlRes).toBe('object')
    } catch (error) {
      expect(error.message).toBe('UrlLoader is not a constructor')
    }
  }, 30000)

  // transform
  try {
    const transformRes = transform('auth_', true, true, ['Query.cases'])
    expect(typeof transformRes).toBe('object')
  } catch (error) {}

  // resolveerComposition
  // try {
  //   const resolverCompositionRes = resolverComposition('auth_', 'prisma/schema.prisma', [])
  //   expect(typeof resolverCompositionRes).toBe('object')
  // } catch (error) {}
})

describe('schema', () => {
  test('schema type-graphql', async () => {
    try {
      const typeRes = await getSchema({customPath: '', contextFile: '', generatedPath: '', datasourcePath: '', plugins: [''], mock: {name: 'cyrus'}})
      expect(typeof typeRes).toBe('object')
    } catch (error) {}
  })
})

import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
  service: {
    graphql: true,
    sources: [{
      name: 'auth',
      type: 'graphql',
      endpoint: 'https://covid-19.dava.engineer/api/graphql',
      prefixTransforms: {
        prefix: 'auth_',
        renameType: true,
        renameField: true,
        ignoreList: ['Query.cases'],
      },
      compositions: [
        {
          resolver: 'Query.appConfigs',
          composer: next => async (root, args, context, info) => {
            const result = await next(root, args, context, info)
            console.log('composition resolver appConfigs')
            return result ? result.data || result : result
          },
        },
      ],
      ignoreFields: ['Query.case']
    }, {
      name: 'cms',
      type: 'openapi',
      // endpoint: 'https://api.apis.guru/v2/specs/wikimedia.org/1.0.0/swagger.yaml',
      endpoint: 'https://api.apis.guru/v2/specs/mashape.com/geodb/1.0.0/swagger.json',
      headers: {
        host: '{context.headers.host}'
      },
      compositions: [
        {
          resolver: '*.*',
          composer: next => async (root, args, context, info) => {
            const result = await next(root, args, context, info)
            return result ? result.data || result : result
          },
        },
      ],
    }]
  },
  logger: {
    prettyPrint: true,
  },
}

export default config

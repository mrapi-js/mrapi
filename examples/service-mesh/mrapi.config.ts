import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
  service: {
    graphql: true,
    sources: [{
      name: 'auth',
      type: 'graphql',
      endpoint: 'xxx',
      prefixTransforms: {
        prefix: 'auth_',
        renameType: true,
        renameField: true,
        ignoreList: ['Query.appConfig'],
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
    }, {
      name: 'cms',
      type: 'openapi',
      endpoint: 'xxx',
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

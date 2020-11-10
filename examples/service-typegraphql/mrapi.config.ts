import { mrapi } from '@mrapi/service'

const config: mrapi.ConfigInput = {
  service: {
    graphql: {
      generator: 'type-graphql',
    },
    mock: true,
  },
  logger: {
    prettyPrint: true,
  },
}

export default config

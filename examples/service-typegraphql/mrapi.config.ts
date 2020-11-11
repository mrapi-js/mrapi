import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
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

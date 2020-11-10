import { mrapi } from '@mrapi/service'

const config: mrapi.ConfigInput = {
  service: [
    {
      name: 'user',
      // mock: true,
    },
  ],
  graphql: {
    stitching: true,
  },
  logger: {
    prettyPrint: true,
  },
}

export default config
// const a: mrapi.Get

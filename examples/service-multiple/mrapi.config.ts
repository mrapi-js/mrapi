import { mrapi } from '@mrapi/service'

const config: mrapi.PartialConfig = {
  service: [
    {
      name: 'user',
      // mock: true,
    },
    {
      name: 'post',
      // mock: true,
    },
  ],
  // graphql: {
  //   stitching: true,
  // },
  logger: {
    prettyPrint: true,
  },
}

export default config
// const a: mrapi.Get

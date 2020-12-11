import { App } from '@mrapi/app'
import { initialize } from 'express-openapi'
import { join } from 'path'
import swaggerUi from 'swagger-ui-express'

// import spec from './swagger.json'

const app = new App()
const prefix = '/api'

const opts = {
  app: app as any,
  apiDoc: {
    swagger: '2.0',
    basePath: prefix,
    info: {
      title: `Started openAPI.`,
      version: '1.0.0',
    },
    paths: {},
    definitions: require('./openapi/definitions.js').default,
  },
  paths: join(__dirname, './openapi/paths'),
  dependencies: {
    mrapiFn: () => {},
  },
}
const instance = initialize(opts)

const apiDoc = instance.apiDoc

app
  .use(`${prefix}/swagger`, swaggerUi.serve, function swaggerUiSetup(
    ...params: [any, any, any]
  ) {
    swaggerUi.setup(apiDoc)(...params)
  })
  .listen(3000, (err: any) => {
    if (err) {
      throw err
    }

    console.log(app.routes)
    console.log(
      `Server listening at http://localhost:${
        (app.server?.address() as any)?.port
      }`,
    )
  })

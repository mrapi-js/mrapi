import { join } from 'path'
import { App } from '@mrapi/app'
import swagger from 'swagger-tools'
import { initialize } from 'express-openapi'

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
    definitions: require('../openapi/definitions.js').default,
  },
  paths: join(__dirname, '../openapi/paths'),
  dependencies: {
    mrapiFn: () => {},
  },
}
const instance = initialize(opts)

swagger.initializeMiddleware(instance.apiDoc, (middleware) => {
  // docs: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-20
  app.use(prefix, middleware.swaggerMetadata())
  // docs: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-validator
  app.use(middleware.swaggerValidator())
  // docs: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-ui
  app.use(
    middleware.swaggerUi({
      apiDocs: `${prefix}/api-docs`,
      swaggerUi: `${prefix}/docs`,
    }),
  )

  app.get(`${prefix}/hi/:name`, (req, res) => {
    res.send(req.params)
  })

  app.listen(3000, (err: any) => {
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
})

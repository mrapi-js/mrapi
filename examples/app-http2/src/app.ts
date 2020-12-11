import pem from 'pem'
import { App } from '@mrapi/app'

pem.createCertificate(
  {
    days: 1,
    selfSigned: true,
  },
  (err, keys) => {
    if (err) {
      throw err
    }

    const app = new App({
      http2: true,
      https: {
        key: keys.serviceKey,
        cert: keys.certificate,
      },
    })

    app.get('/', (_req, res) => {
      res.end('Hello World!')
    })

    app.listen(3000, (err: any) => {
      if (err) {
        throw err
      }

      console.log(app.routes)
      console.log(
        `Server listening at https://localhost:${
          (app.server?.address() as any)?.port
        }`,
      )
    })
  },
)

# @mrapi/app

Web framework for Node.js. Similar to [express](https://github.com/expressjs/express). Compatible with express.

## Usage

```bash
yarn add @mrapi/app
```

```ts
import { App } from '@mrapi/app'

const app = new App()

app
  .get('/', (_req, res) => {
    res.end('Hello World!')
  })
  .listen(3000, (err: any) => {
    if (err) {
      throw err
    }

    console.log(
      `Server listening at http://localhost:${
        (app.server?.address() as any)?.port
      }`,
    )
  })
```

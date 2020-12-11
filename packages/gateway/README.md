# @mrapi/gateway

API gateway for node.js.

## Usage

```bash
yarn add @mrapi/gateway
```

```ts
import { Gateway } from '@mrapi/gateway'

const gateway = new Gateway({
  app: {},
  services: [
    // add service here
    {
      name: 'service',
      url: 'http://0.0.0.0:3000',
    },
  ],
})

gateway.start().catch((err) => gateway.logger.error(err))
```

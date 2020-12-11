# @mrapi/service

API service, support GraphQL and OpenAPI.

## Usage

```bash
yarn add @mrapi/service
```

```ts
import { service } from '@mrapi/service'

const service = new Service()

service.start().catch((err) => service.logger.error(err))
```

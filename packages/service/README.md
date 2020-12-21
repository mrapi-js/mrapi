# @mrapi/service

## If `graphql: true`

- `express-graphql`
- `graphql-playground-middleware-express`

## Features

- single service + single tenant
- single service + multi tenants
- multi services + single tenant
- multi services + multi tenants
- graphql stitching
  - all services
  - partial services
  - multi tenants + single tenant
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

# @mrapi/graphql

## Usage

```bash
yarn add @mrapi/graphql
```

```ts
import { graphqlMiddleware } from '@mrapi/graphql'

const app = app // express app or @mrapi/app

// options: graphql.Options
app.post('/graphql', graphqlMiddleware(options))
```

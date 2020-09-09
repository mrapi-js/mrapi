## configuration of @mrapi/api

**The current configuration is only available for `@mrapi/api`**

Note: Please read [mrapi overall configuration description](https://github.com/mrapi-js/mrapi/blob/dev/docs/Configuration/Common.md) first

### Parameter Description

```js
// @mrapi/api config
api: {
  // @mrapi/api openapi config
  openapi: {
    // @mrapi/api openapi custom api dir
    dir: '/src/openapi',
    // @mrapi/api openapi custom api preifx
    prefix: '/api',
  },

  // @mrapi/api graphql config
  graphql: {
    // @mrapi/api graphql custom api dir
    dir: '/src/graphql',
    // @mrapi/api graphql api prefix
    path: '/graphql',
    // @mrapi/api graphql playground
    playground: 'playground',
    // @mrapi/api graphql sources
    sources: [],
  },

  // @mrapi/api server config
  server: {
    // @mrapi/api server listen port
    port: 1358,
    // @mrapi/api server type
    type: 'standalone',
    // @mrapi/api fastify server options
    options: {},
  },
  // @mrapi/api prisma schema names array
  schemaNames: [],
  // auto run scripts mrapi generate
  autoGenerate: true,
  // mrapi db choose header key
  schemaIdentity: 'mrapi-schema',
}
```

#### tenantIdentity：

The key value of the multi-tenant in the header

+ Type: `string`
+ Default: `mrapi-pmt`

#### api:

`Object. api` package configuration

#### api.schemaNames:

The name of the schema that needs to be loaded when the `type` is `combined`

+ Type: `array`
+ Default: `[]`

#### api.autoGenerate:

Whether to execute the `npx mrapi generate script` according to `api.schemaNames` (it is recommended to open in the production environment, and open in the development environment after db changes)

+ Type: `Boolean`
+ Default: `true`

#### api.schemaIdentity:

Use In combination with dal, customize the `header key` selected by db in `openapi`

+ Type: `string`
+ Default: `mrapi-db`

#### api.openapi:

`Object. openapi` related configuration

#### api.openapi.dir:

Custom `openapi` storage directory

+ Type: `string`
+ Default: `/src/openapi`

#### api.openapi.prefix:

Custom `openapi` routing prefix

+ Type: `string`
+ Default: `/api`

#### api.graphql:

`Object. graphql` related configuration

#### api.graphql.dir:

Custom `graphql` storage directory

+ Type: `string`
+ Default: `/src/graphql`

#### api.graphql.path:

Graphql access path, the real access path is `${api.graphql.path}/:${schemaName}`, （正则匹配四个字不会翻译 先等等）schemaName(Determine the prismaClient in the `handler` context,  please pass `default` for `${schemaName}` to ensure that the route can be hit, when using `standlone` mode

+ Type: `string`
+ Default: `/graphql`

#### api.graphql.palyground:

`graphql palyground` address, if `false`, it will close the `playground`

+ Type: `string | boolean`
+ Default: `palyground`

#### api.graphql.sources:

Graphql source configuration that needs to be mesh

+ Type: `array`
+ Default: `[]`

#### api.server:

`Object. server` related configuration

#### api.server.port:

Service listening port

+ Type: `number`
+ Default: `1358`

#### api.server.type:

The usage mode of api package, ['Use alone','Use in combination with dal'], enum['standalone','combined']

+ Type: `string`
+ Default: `standalone`

#### api.server.options:

Options that will bt transmitted to `fastify`

+ Type: `Object`
+ Default: `{}`



#### 


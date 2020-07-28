# 配置项之 plugins

此配置文件路径为 `config/plugins`，将用于：

- [Mrapi service](../Mrapi.zh-CN.md) 插件扩展

- [@mrapi/cli](../CLI.zh-CN.md) 中进行使用

## 配置参数

```js
{
  [pluginName]: {
    enable: true,
    options: {}
  },
  ...
}
```

### pluginName

插件名称（文件索引路径）

**注意:** 请确保 `require.resolve()` 能够找到

### enable

- 参数类型：`Boolean`

- 默认值：`false`

### options

- 参数类型：`{}`

- 默认值：`undefined`

## 内置插件

项目内部提供了多个默认的插件扩展，统一以 `builtIn:` 开头

### builtIn:graphql

依赖于 `fastify-gql`

```js
"builtIn:graphql": {
  enable: true,
  options: {
    path: '/graphql',
    // schema: {
    //   // methods: findMany, findOne, create, update, upsert, updateMany, delete, deleteMany, aggregate
    //   User: ['findMany', 'create', 'aggregate'],
    //   Role: ['findMany', 'create', 'aggregate'],
    // },
    ide: process.env.NODE_ENV === 'production' ? false : 'playground',
    noIntrospection: process.env.NODE_ENV === 'production' ? true : false,
    // ! important: temporary disable graphql-jit, fix memory leak caused by 'very long string'
    // jit: 1,
    queryDepth: 100,
    buildSchema: {
      resolvers: {
        generated: '../src/graphql/generated', // cli generate 中生成 TYPE_GRAPHQL_OUTPUT
        custom: './src/graphql/resolvers',
      },
      emitSchemaFile: 'exports/schema.graphql',
      validate: false,
    },
  },
}
```

#### noIntrospection

是否开启 `Introspection` 模式

#### schema

配置要使用的 `schema datamodel`，默认为全部

#### buildSchema

配合上面的 `schema` 生成新的 schema 配置文件。更多详情查看 [buildSchema](https://github.com/MichalLytek/type-graphql)

#### 其他参数

将充当 [fastify-gql](https://github.com/mcollina/fastify-gql#plugin-options) 的参数（`schema` 和 `context` 除外）

### builtIn:openapi

依赖于 `fastify-oas`

```js
"builtIn:openapi": {
  enable: true,
  options: {
    prefix: '/api',
    // schema: {
    //   // methods: findMany, findOne, create, update, delete
    //   User: ['findMany'],
    //   Role: ['findMany'],
    // },
    custom: {
      path: 'src/openapi',
    },
    // https://gitlab.com/m03geek/fastify-oas#plugin-options
    documentation: {
      enable: true,
      options: {
        routePrefix: '/documentation',
        swagger: {
          info: {
            title: pkg.name,
            description: pkg.description,
            version: pkg.version,
          },
          consumes: ['application/json'],
          produces: ['application/json'],
          servers: [
            {
              url: 'http://127.0.0.1:1358',
              description: 'Local Server',
            },
          ],
        },
        exposeRoute: true,
      },
    },
  },
}
```

参数类型

```ts
import { FastifyOASOptions } from 'fastify-oas'

type OpenapiOptions = {
  prefix?: string
  custom?: {
    path: string
  }
  schema?: any
  documentation?: {
    enable: boolean
    options: FastifyOASOptions
  }
}
```

#### prefix

路由前缀，默认为 `"/"`

#### custom

`path` 自定义文件路径

#### schema

配置要使用的 `schema datamodel`，默认为全部

#### documentation

文档相关，配合 `fastify-oas` 使用

## 自定义扩展插件

符合 [Fastify Plugins](https://github.com/fastify/docs-chinese/blob/master/docs/Plugins.md) 规范的插件。

**常用插件请查看下面 “默认推荐配置” 示例**

## 完整示例

默认推荐配置

```js
const pkg = require('../package.json')

module.exports = {
  // https://github.com/fastify/fastify-cookie#example
  'fastify-cookie': {
    enable: true,
    options: {},
  },
  // https://github.com/fastify/fastify-cors#options
  'fastify-cors': {
    enable: true,
    options: {
      credentials: true,
    },
  },
  // https://github.com/fastify/fastify-compress#options
  'fastify-compress': {
    enable: true,
    options: {
      global: false,
    },
  },
  // https://github.com/fastify/fastify-formbody#options
  'fastify-formbody': {
    enable: true,
    options: {},
  },
  // https://github.com/fastify/fastify-helmet#how-it-works
  'fastify-helmet': {
    enable: true,
    options: { hidePoweredBy: { setTo: 'Mrapi' } },
  },
  'builtIn:graphql': {
    enable: true,
    options: {
      path: '/graphql',
      // schema: {
      //   // methods: findMany, findOne, create, update, upsert, updateMany, delete, deleteMany, aggregate
      //   User: ['findMany', 'create', 'aggregate'],
      //   Role: ['findMany', 'create', 'aggregate'],
      // },
      ide: process.env.NODE_ENV === 'production' ? false : 'playground',
      noIntrospection: process.env.NODE_ENV === 'production' ? true : false,
      // ! important: temporary disable graphql-jit, fix memory leak caused by 'very long string'
      // jit: 1,
      queryDepth: 100,
      buildSchema: {
        resolvers: {
          generated: '../src/graphql/generated', // cli generate 中生成 TYPE_GRAPHQL_OUTPUT
          custom: './src/graphql/resolvers',
        },
        emitSchemaFile: 'exports/schema.graphql',
        validate: false,
      },
    },
  },
  'builtIn:openapi': {
    enable: true,
    options: {
      prefix: '/api',
      // schema: {
      //   // methods: findMany, findOne, create, update, delete
      //   User: ['findMany'],
      //   Role: ['findMany'],
      // },
      custom: {
        path: 'src/openapi',
      },
      // https://gitlab.com/m03geek/fastify-oas#plugin-options
      documentation: {
        enable: true,
        options: {
          routePrefix: '/documentation',
          swagger: {
            info: {
              title: pkg.name,
              description: pkg.description,
              version: pkg.version,
            },
            consumes: ['application/json'],
            produces: ['application/json'],
            servers: [
              {
                url: 'http://127.0.0.1:1358',
                description: 'Local Server',
              },
            ],
          },
          exposeRoute: true,
        },
      },
    },
  },
}
```

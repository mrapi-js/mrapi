# @mrapi/api 使用文档

`@mrapi/api` 作为 API 层直接给客户端提供服务,能够聚合其他openapi/graphql接口，通过prisma操作数据库。


## 核心能力

- 日志多端(文件+终端)输出，自动分割
- [x] `standalone` 模式
  - [x] 聚合graphql接口
  - [x] 自定义graphql接口
  - [x] 代理openapiy接口
  - [x] 自定义openapi接口
- [x] `combined` 模式
  - [x] 暴露dal CRUD graphql接口
  - [x] 自定义graphql接口(使用prisma实例)
  - [ ] 暴露dal CRUD openapi接口
  - [x] 自定义openapi接口(使用prisma实例)

## 安装

```bash
npm install @mrapi/api --save
```

## `standalone` 模式使用
- 参考 [api-basic](../examples/api-basic) 项目
- **注意\: 不提供数据库操作能力**

### 一、配置基础配置文件

```js
// config/mrapi.config.js
exports.default = {
  api: {
    openapi: {
      dalBaseUrl: 'http://ip OR domains' // openapi代理目的地地址
    },
    graphql: {
      sources: [
        {
          name: 'graphqlSourceName',
          endpoint: 'http://ip OR domains', // 源graphql服务地址
          prefix: 'prefix_', // graphql operationName前缀
          snapshot: false // 请求graphql快照
        }
      ]
    }
  }
}
```
**注意\: 其他配置项请参考 [API 配置项](./Configuration/API.zh-CN.md)**

### 二、启动 API 服务
```ts
import Api, { log } from '@mrapi/api'

(async function () {
  const api = new Api()
  await api.start()
})().catch((err) => {
  log.error(err)
})
```

### 三、访问服务

```cmd
Server listening at http://127.0.0.1:1358
# 访问 playground http://127.0.0.1:1358/playground
# 访问 graphql http://127.0.0.1:1358/graphql/default
# 访问自定义 openapi http://127.0.0.1:1358/api/xx
# 其他路由请查看终端打印 Routes Tree
```

## `combined` 模式
- 参考 [api-combine](../examples/api-combine) 项目
- **注意\: 不提供`graphql-mesh`和`openapi proxy`能力**
- 通过 `headers['mrapi-pmt']` 携带租户信息，可通过 `mrapi.config.js` 中的 `tenantIdentity` 更改 key 值
- **_选择 schema_** graphql 接口通过 `/graphql/:schemaName` 确定使用哪一个 schema 对应的 prismaClient，`/graphql` 前缀可通过 `api.graphql.path` 修改
- **_选择 schema_** openapi 接口通过 `headers['mrapi-schema']` 确定使用哪一个 schema 对应的 prismaClient，可通过 `mrapi.config.js` 中的`api.schemaIdentity` 更改 key 值

### 一、配置基础配置文件

```js
// config/mrapi.config.js
exports.default = {
  managementUrl: 'mysql://root:123456@127.0.0.1/management',
  api: {
    schemaNames: ['one'], // prisma schema names
    server: {
      type: 'combined',
    },
  }
}
```
**注意\: 其他配置项请参考 [API 配置项](./Configuration/API.zh-CN.md)**

### 二、启动前配置
请参考 [DAL 文档](./DAL.zh-CN.md)，配置好prisma相关依赖文件和配置项,否则可能会导致启动失败

### 三、启动 API 服务
```ts
import Api, { log } from '@mrapi/api'

(async function () {
  const api = new Api()
  await api.start()
})().catch((err) => {
  log.error(err)
})
```

### 四、访问服务
```cmd
Server listening at http://127.0.0.1:1358
# 访问 playground http://127.0.0.1:1358/playground
# 访问 graphql http://127.0.0.1:1358/graphql/${schemaName}
# 访问自定义 openapi http://127.0.0.1:1358/api/xx
# 其他路由请查看终端打印 Routes Tree
```

## Tips
- 对于 Fastify Server 实例的自定义扩展，可以在创建 `@mrapi/api` 实例之后，以及 `api.start()` 之前，通过调用 `api.server.xxx` 进行添加
- `@mrapi/api` 暴露了 `log` 实例，可在服务中使用（参考 `pino` ），日志会同时打印在终端，记录在磁盘，并提供分割能力
- 在 `${root}/src/openapi` 目录下自定义 openapi 接口，可参考 `fastify route` 相关文档
- 在 `${root}/src/graphql` 目录下自定义 graphql 接口，可参考 `graphql nexus` 相关文档
- `standalone` 模式,自定义 graphql/openapi handler 的上下文中注入了 `execute` 方法，可以用于调用聚合的 graphql 服务

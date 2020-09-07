# @mrapi/api 使用文档

`@mrapi/api` 作为 API 层直接给客户端提供服务。

## 提供能力

- 两种不同使用方式，提供操作数据库或接口聚合/透传能力
- 通过 Fastify 启动 Server 服务
- 对于 Fastify Server 实例的自定义扩展，可以在创建 `@mrapi/api` 实例之后，以及 `api.start()` 之前，通过调用 `api.server.xxx` 进行添加
- `@mrapi/api` 暴露了 `log` 实例，可在服务中使用（参考 `pino` ），日志会同时打印在终端，记录在磁盘，并提供分割能力
- 在 `${root}/src/openapi` 目录下自定义 openapi 接口，可参考 `fastify route` 相关文档
- 在 `${root}/src/graphql` 目录下自定义 graphql 接口，可参考 `graphql nexus` 相关文档
- 自定义 graphql/openapi handler 的上下文中注入了 `execute` 方法，可以用于调用聚合的 graphql 服务

## 配置说明

参考 [API 配置项](./Configuration/API.zh-CN.md)

## 工作模式

它有两种使用模式 `standlone` 或 `combined`，两种模式下它都能加载自定义的 openAPI 和 graphql 接口，并通过 Fastify 启动 Server 供客户端使用。其中 `standlone` 模式下它能通过 `graphql-mesh` 聚合多个 `graphql` 接口，而 `combined` 模式下它能加载 [@mrapi/dal](./DAL.zh-CN.md) 生成的 `graphql schema` 和 `prisma client`.

## `standlone` 模式

- 参考 [api-basic](../examples/api-basic) 项目
- 独立使用模式下，`@mrapi/api` 不提供数据库操作能力
- 提供 **_graphql-mesh_** 能力，在 `config/mrapi.config.js` 文件的 `api.graphql.sources` 中配置源 graphql 服务
- 提供 **_openapi proxy_** 能力，在 `config/mrapi.config.js` 文件的 `api.openapi.dalBaseUrl` 中配置代理目的地的访问地址

## `combined` 模式

- 参考 [api-combine](../examples/api-combine) 项目
- 参考 [@mrapi/dal](./DAL.zh-CN.md) 文档，正确创建 `prisma schema` 相关文件，否则可能会导致生成 prismaClient 失败
- `combined` 模式下，`@mrapi/api` 不提供 `graphql-mesh` 和 `openapi proxy` 能力
- 通过 `headers['mrapi-pmt']` 携带租户信息，可通过 `mrapi.config.js` 中的 `tenantIdentity` 更改 key 值
- **_选择 schema_** graphql 接口通过 `/graphql/:schemaName` 确定使用哪一个 schema 对应的 prismaClient，`/graphql` 前缀可通过 `api.graphql.path` 修改
- **_选择 schema_** openapi 接口通过 `headers['mrapi-schema']` 确定使用哪一个 schema 对应的 prismaClient，可通过 `mrapi.config.js` 中的`api.schemaIdentity` 更改 key 值
- 自定义 graphql/openapi handler 的上下文中注入了 `prisma` 实例，可以用于数据库操作

# @mrapi/api 使用文档

## 版本要求
**Node:**
- NodeJS >= 10.x
- NPM >= 6.x

**[Database]:**
- MySQL >= 5.6
- PostgreSQL >= 10
- SQLite >= 3

## 关于@mrapi/api
@mrapi/api作为api层直接给客户端提供服务，它有两种使用模式`combined` 或 `standlone`,两种模式下它都能加载自定义的openapi和graphql接口，并通过fastify启动server暴露给客户端，`standlone`模式下它能通过`graphql-mesh`聚合多个后端`graphql`接口，`combined`模式下它能加载@mrapi/dal生成的graphql schema和prisma client.

## 提供能力
- 两种不同使用方式，提供操作数据库或接口聚合/透传能力
- 通过fastify启动server服务
- 对于fastify server实例的自定义启动操作，可以在创建@mrapi/api实力后，`api.start()`前，通过`api.server.xxx`进行
- @mrapi/api 暴露了`log`实例，可在服务中使用(参考`pino`),日志会同时打印在终端，记录在磁盘，并提供分割能力
- 在`${root}/src/openapi`目录下自定义openapi接口，可参考`fastify`route相关文档
- 在`${root}/src/graphql`目录下自定义graphql接口，可参考`graphql-nexus`相关文档
- 自定义 graphql/openapi handler的上下文中注入了`execute`方法，可以用于调用聚合的graphql服务


## 独立使用模式
- 参考`mrapi/examples/api-basic`项目
- 独立使用模式下，@mrapi/api不提供数据库操作能力
- 提供 ***graphql-mesh*** 能力，在`config/mrapi.config.js`文件的`api.graphql.sources`中配置源graphql服务
- 提供 ***openapi proxy*** 能力，在`config/mrapi.config.js`文件的`api.openapi.dalBaseUrl`中配置代理目的地的访问地址

## 结合@mrapi/dal使用模式
- 参考`mrapi/examples/api-combine`项目
- 请参考`@mrapi/dal`文档，正确创建prisma schema相关文件，否则可能会导致生成prismaClient失败
- 结合使用模式下，@mrapi/api不提供graphql-mesh和openapi proxy能力
- 通过`headers['mrapi-pmt']`携带租户信息，可通过`mrapi.config.js`中的`tenantIdentity`更改key值
- ***选择schema*** graphql接口通过`/graphql/:schemaName`确定使用哪一个schema对应的prismaClient，`/graphql`前缀可通过`api.graphql.path`修改
- ***选择schema*** openapi接口通过`headers['mrapi-schema']`确定使用哪一个schema对应的prismaClient，可通过`mrapi.config.js`中的`api.schemaIdentity`更改key值
- 自定义 graphql/openapi handler的上下文中注入了`prisma`实例，可以用于数据库操作
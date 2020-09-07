# mrapi.config.js

## 公共配置

- `tenantIdentity`: String.默认值`mrapi-pmt` 多租户在 header 中的 key 值

## @mrapi/dal 配置

- `managementUrl`: String. 多租户管理 db 连接地址
- `envPath`: String.默认值`config/.env` prisma .env 文件地址
- `inputSchemaDir`: String.默认值`config/prisma` prisma schema 文件目录
- `schemaDir`: String.默认值`prisma` prisma schema 文件目录(默认的 schema.prisma)
- `outputDir`: String.默认值`node_modules/.prisma-mrapi` 生成的 schema 文件存放文件夹

## @mrapi/api 配置

- `api`: Object. api 包配置
- `api.openapi`: Object. openapi 相关配置
- `api.openapi.dir`: String.默认值`/src/openapi`自定义 openapi 存放目录
- `api.openapi.prefix`: String.默认值`/api`自定义 openapi 路由前缀
- `api.graphql`: Object. graphql 相关配置
- `api.graphql.dir`: String. 默认值`/src/graphql`自定义 graphql 文件目录
- `api.graphql.path`: String. 默认值`/graphql`graphql 访问路径,真实访问路径为`${api.graphql.path}/:${schemaName}`,正则匹配 schemaName(决定 handler 上下文中的 prismaClient，`standlone`模式使用时`${schemaName}`请传`default`，确保路由能被命中)
- `api.graphql.palyground`: String|Boolean. 默认值`palyground`graphql palyground 地址，如果`false`则是关闭 playground
- `api.graphql.sources`: Array. 默认值`[]`需要 mesh 的 graphql 源配置
- `api.server`: Object. server 服务相关配置
- `api.server.port`: Number. 默认值`1358`服务监听端口
- `api.server.type`: String. 默认值`standalone`enum['standalone','combined']api 包使用模式['单独使用','结合 dal 使用']
- `api.server.options`: Object.默认值`{}`透传给 fastify 的 options
- `api.schemaNames`: Array.默认值`[]`type 为`combined`时需要加载的 schema 名称
- `api.autoGenerate`: Boolean.默认值`true`,是否根据根据`api.schemaNames`自定执行`npx mrapi generate`脚本(生产环境建议开启，开发环境在 db 变更后开启)
- `api.schemaIdentity`: String.默认值`mrapi-db`,dal 结合使用下，自定义 openapi 中 db 选择的 header key

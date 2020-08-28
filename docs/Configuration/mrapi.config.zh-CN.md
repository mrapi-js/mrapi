# mrapi.config.js

## 公共配置
- `tenantIdentity`: String.默认值`mrapi-pmt` 多租户在header中的key值

## @mrapi/dal配置
- `managementUrl`: String. 多租户管理db连接地址
- `envPath`: String.默认值`config/.env` prisma .env文件地址
- `inputSchemaDir`: String.默认值`config/prisma` prisma schema文件目录
- `schemaDir`: String.默认值`prisma`  prisma schema文件目录(默认的schema.prisma)
- `outputDir`: String.默认值`node_modules/.prisma-mrapi` 生成的schema文件存放文件夹

## @mrapi/api配置
- `api`: Object. api包配置
- `api.openapi`: Object. openapi相关配置
- `api.openapi.dir`: String.默认值`/src/openapi`自定义openapi存放目录
- `api.openapi.prefix`: String.默认值`/api`自定义openapi路由前缀
- `api.graphql`: Object. graphql相关配置
- `api.graphql.dir`: String. 默认值`/src/graphql`自定义graphql文件目录
- `api.graphql.path`: String. 默认值`/graphql`graphql访问路径,真实访问路径为`${api.graphql.path}/:${schemaName}`,正则匹配schemaName(决定handler上下文中的prismaClient，`standlone`模式使用时`${schemaName}`请传`default`，确保路由能被命中)
- `api.graphql.palyground`: String|Boolean. 默认值`palyground`graphql palyground 地址，如果`false`则是关闭playground
- `api.graphql.sources`: Array. 默认值`[]`需要mesh的graphql源配置
- `api.server`: Object. server服务相关配置
- `api.server.port`: Number. 默认值`1358`服务监听端口
- `api.server.type`: String. 默认值`standalone`enum['standalone','combined']api包使用模式['单独使用','结合dal使用']
- `api.server.options`: Object.默认值`{}`透传给fastify的options
- `api.schemaNames`: Array.默认值`[]`type为`combined`时需要加载的schema名称
- `api.autoGenerate`: Boolean.默认值`true`,是否根据根据`api.schemaNames`自定执行`npx mrapi generate`脚本(生产环境建议开启，开发环境在db变更后开启)
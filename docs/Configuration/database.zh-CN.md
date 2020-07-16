# 配置项之 database

此配置文件路径为 `config/database`，将用于：

- 配合 [@mrapi/cli](../CLI.zh-CN.md) 生成 `Prisma Client` 配置文件
- 生成[mrapi service](../Mrapi.zh-CN.md) 默认环境变量

<!--
export type TenantOptions = {
  name: string
  provider: string
  url: string
}
export type DBConfig = {
  client: string
  schema: string
  schemaOutput: string
  url?: string
  prismaClient?: {}
  multiTenant?: {
    management: {
      url: string
    }
    tenants: TenantOptions[]
    identifier: (request: FastifyRequest, reply: FastifyReply) => string | void
  }
}

provider: 'sqlite',
client: 'prisma',
url: 'file:dev.db',
schema: './config/schema.prisma',
schemaOutput: './prisma/schema.prisma',
prismaClient: {},
 -->

## 参数选项

| 名称           | 描述 | 参数类型 | 默认值                   | 可选 |
| -------------- | ---- | -------- | ------------------------ | ---- |
| `provider`     |      | string   | "sqlite"                 |      |
| `client`       |      | string   | "prisma"                 |      |
| `schema`       |      | string   | "./config/schema.prisma" |      |
| `schemaOutput` |      | string   | "./prisma/schema.prisma" |      |
| `url`          |      | string   | "file:dev.db"            | √    |
| `prismaClient` |      | {}       |                          | √    |
| `multiTenant`  |      | {}       |                          | √    |

### prismaClient

...

### multiTenant

...

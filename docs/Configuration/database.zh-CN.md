# 配置项之 database

此配置文件路径为 `config/database`，将用于：

- 配合 [@mrapi/cli](../CLI.zh-CN.md) 生成 `Prisma Client` 配置文件
- 生成 [mrapi service](../Mrapi.zh-CN.md) 默认环境变量

## 参数选项

### provider

数据库类型

- 参数类型：`"postgresql" | "mysql" | "sqlite"`

- 默认值：`"sqlite"`

### url

所对应的数据库的连接地址，如：`mysql://root:password@127.0.0.1:3306/test`

- 非必填

- 参数类型：`string`

- 默认值：`"file:dev.db"`

**注意:**启用多租户时，可忽略此配置项

### client

自动化数据构建器/解析器，目前仅支持 `“prisma”`

- 参数类型：`“prisma”`

- 默认值：`"prisma"`

### schema

用户 schema 配置文件的路径（相对于项目根目录）

- 参数类型：`string`

- 默认值：`"./config/schema.prisma"`

### schemaOutput

通过 `database.schema` 自动化生成的 `prisma` 配置文件的路径（相对于项目根目录）

- 参数类型：`string`

- 默认值：`"./prisma/schema.prisma"`

### prismaClient

实例化 `prismaClient` 时候传递的 [options](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/constructor)。多租户模式中它将会用于 `tenantOptions`

- 非必填

- 参数类型：`{}`

**注意:** 单租户时 `{ datasources, __internal }` 无效！（将被内部覆盖）

### multiTenant

多租户配置项

- 非必填

- 参数类型：`MultiTenant`

```ts
import { FastifyRequest, FastifyReply } from 'fastify'

type TenantOptions = {
  name: string // 租户类别标识
  provider: string
  url: string
}

export type MultiTenant = {
  management: {
    url: string // 此为多租户管理表的 db 地址（不同于 tenants 中的 db url）
  }
  tenants: TenantOptions[]
  identifier: (request: FastifyRequest, reply: FastifyReply) => string | void // 获取租户分类的钩子函数，返回值对应 TenantOptions.name
}
```

**注意:**上面代码的注释说明很重要！

## 完整示例

### 单租户

```js
module.exports = {
  provider: 'sqlite',
  url: 'file:dev.db',
  client: 'prisma',
  schema: './config/schema.prisma',
  schemaOutput: './prisma/schema.prisma',
  prismaClient: {
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  },
}
```

### 多租户

```js
module.exports = {
  provider: 'sqlite',
  client: 'prisma',
  schema: './config/schema.prisma',
  schemaOutput: './prisma/schema.prisma',
  prismaClient: {
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  },
  multiTenant: {
    management: {
      url: 'file:management.db',
    },
    tenants: [
      {
        provider: 'sqlite',
        name: 'client-dev',
        url: 'file:dev.db',
      },
      {
        provider: 'sqlite',
        name: 'client-test',
        url: 'file:test.db',
      },
    ],
    identifier (request) {
      return request.headers['tenant-id']
    },
  },
}
```

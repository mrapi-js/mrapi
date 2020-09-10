# @mrapi/dal 使用文档

DAL 是基于 [prisma 2](https://www.prisma.io/) 的上层应用框架。我们致力于快速生成标准化 CURD 服务，同时也能够在不同租户和不同场景下进行灵活切换。

## 核心能力

- [x] 多租户支持
- [x] 多 prisma 实例支持
- [x] 数据库支持
  - [x] PostgreSQL
  - [x] MySQL
  - [x] SQLite
- [ ] 数据缓存
- [ ] 多协议调用：
  - [x] prismaClient
  - [x] graphql
  - [x] openAPI
  - [ ] gRPC
  - [ ] web socket
- [ ] 自定义事务
- [ ] 服务接入（日志、监控、频控等）

## 安装

```bash
npm install @mrapi/dal --save
```

## 如何使用

当前以最常见的使用方式为例，HTTP Server。

### 一、配置基础配置文件

在默认配置文件下添加依赖项 `"managementUrl"`

```js
// config/mrapi.config.js
exports.default = {
  managementUrl: 'file:config/db/management.db',
}
```

**注意\: 其他配置项请参考 [DAL 配置项](./Configuration/DAL.zh-CN.md)**

### 二、为初始化做准备

配置 DALOptions （配置的过程可能需要用到 [@mrapi/cli](./CLI.zh-CN.md)）

```ts
import { DALOptions } from '@mrapi/dal/lib/types'

const options: DALOptions = [
  {
    name: 'one',
    defaultTenant: {
      name: 'dev',
      url: 'file:../config/db/dev.db', // 默认租户为此 db
    },
  },
  {
    name: 'two',
    defaultTenant: {
      url: 'file:../config/db/prod.db', // 默认租户为此 db
    },
  },
  {
    name: 'three',
    defaultTenant: {
      name: 'dev', // 默认租户为 management 表中标识为 dev 的 db
    },
    openAPI: {
      enable: false, // 不启用 openAPI
    },
  },
]
```

**注意\: 每一项配置都必须符合要求，详情请参考以下的配置说明**

### 三、启动 DAL 服务

```ts
import DAL from '@mrapi/dal'

const options = ...

const app = new DAL(options)
app.start() // 默认ip、端口启动服务
```

### 四、访问服务

好了！开始享受 DAL 带来的便捷吧

```cmd
🚀 Server ready at: http://0.0.0.0:1358

⭐️ [one] Running a GraphQL API route at: /graphql/one
⭐️ [one] Running a openAPI route at: /api/one
⭐️ [one] Running a openAPI Swagger document at: /api/one/swagger
```

**注意\: 如果访问未配置 defaultTenant 的 schema 时，需要设置请求的 tenantIdentity 才能够正常访问请求！**

## 基础配置项

参考 [DAL 基础配置项](./Configuration/DAL.zh-CN.md)

## DALOptions

```ts
import { OptionsData } from 'express-graphql'

interface openAPIOptions {
  dependencies?: {
    [name: string]: Function | Promise<Function>
  }
  oasDir: string
  validateApiDoc?: boolean
}

export interface DALOption {
  name: string
  nexusDir?: string
  prismaClientDir?: string
  defaultTenant?: {
    name?: string
    url?: string
  }
  graphql?: {
    enable?: boolean
    options?: OptionsData
  }

  
  openAPI?: 
    | {
        enable?: true
        options: openAPIOptions
      }
    | {
        enable: false
        options?: openAPIOptions
      } 
}

export type DALOptions = DALOption[]
```

### name

schema 唯一标识

- 必填

- 参数类型：`string`

- 参考值：schema 文件名

### defaultTenant

默认租户配置信息

- 参数类型：`object`

```ts
{
  name?: string // 默认租户标识，对应于 management 表中的 db
  url?: string // 默认租户的 db 连接地址
}
```

**注意:\ 当 url 存在时，name 不再对应 management 表中的 db**

### prismaClientDir

`prisma client` 的目录

- 参数类型：`string`

- 默认值：`mrapiConfig.outputDir`

**注意:\ 通过 mrapi/cli 生成的 prisma client 可以直接使用默认值**

### nexusDir

`nexus type` 的目录

- 参数类型：`string`

- 默认值：`path.join(mrapiConfig.outputDir, 'nexus-types')`

**注意:\ 通过 mrapi/cli 生成的 nexus type 可以直接使用默认值**

### graphql

graphql 服务配置信息

- 参数类型：`object`

```ts
{
  enable?: boolean // 是否启用 graphql, 默认启用
  options?: OptionsData // 参考 import { OptionsData } from 'express-graphql'
}
```

### openAPI

openAPI 服务配置信息

- 参数类型：`object`

```ts
| {
    enable?: true // 是否启用 openAPI, 默认启用
    options: openAPIOptions
  }
| {
    enable: false
    options?: openAPIOptions
  }

openAPIOptions?: {
  dependencies?: { // oas dependencies 方法扩展
    [name: string]: Function | Promise<Function>
  }
  oasDir: string // oas 目录
  validateApiDoc?: boolean // 是否校验 oas 文档
}
```

## API

实例化后对外提供的 API 方法

### getPrisma = async (name: string, tenantName?: string) => prismaClient

- 异步方法

通过 schema 标识 和 tenant 标识，返回对应的 `prisma client`。当 tenantName 为空的时候，将尝试在配置中找出默认值进行填充。

### hasSchema(name: string): boolean

schema 标识是否存在

### getSchema(name: string): GraphQLSchema

获取 @nexus/schema

### addSchema(name: string, option: DALSchemaOptions = {}): boolean

添加 schema 标识为 name 的 `DALSchemaOptions` 配置，返回值可用于判断添加是否成功。

### removeSchema(name: string): boolean

移除 schema 标识为 name 的相关配置，返回值可用于判断移除是否成功。

### async start(serverOptions?: ServerOption)

- 异步方法

启动服务

```ts
export interface ServerOptions {
  host?: string
  port?: number
  tenantIdentity?: string // 默认取用 mrapi.config.js 中的 tenantIdentity
}
```

### async stop()

- 异步方法

停止服务

## 实例对象

实例化对象的属性

### server

DAL 的 server 实例对象

```ts
app.start().then(() => {
  const thisApp = app.server.app // 实际为 Express 实例

  // 可以通过 thisApp 调用 Express 的能力
  thisApp.use(cors()) // 注意：DAL 中已内置 cors 和 body-parser 插件，这里只是示例
})
```

**注意\： 仅在 `app.start()` 后实例化才存在。**

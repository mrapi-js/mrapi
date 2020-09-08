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
  openAPI?: {
    enable?: boolean
    options?: {
      dependencies?: {
        [name: string]: Function | Promise<Function>
      }
      oasDir: string
      validateApiDoc?: boolean
    }
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
  name?: string
  url?: string
}
```
  
#### name

默认租户标识，对应于 management 表中的 db

**注意:\ 当 url 存在时，name 不再对应 management 表中的 db**

#### url

默认租户的 db 连接地址

### prismaClientDir

### nexusDir

### graphql

### openAPI

## API

###

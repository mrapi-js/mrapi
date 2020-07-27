# 入门

这篇文档将向你介绍 Mrapi 框架及其特性，也包含了一些示例和指向其他文档的链接。<br>
那，这就开始吧！

## 环境依赖

**Node:**

- NodeJS >= 10.x
- NPM >= 6.x

**Database:**

- MySQL >= 5.6
- PostgreSQL >= 10
- SQLite >= 3

## 快速开始

### 一、创建一个 mrapi 项目

我们内置了 `create-mrapi-app` ci 库，方便大家快速初始化项目。

```bash
# 推荐以下命令
# 将自动全局安装 create-mrapi-app

yarn create mrapi-app my-project

# or
npx create-mrapi-app my-project

# or
pnpx create-mrapi-app my-project
```

此时项目已生成完毕！

### 二、修改配置文件

查看配置 [config/database](./docs/Configuration/database.zh-CN.md)、[config/plugins](./docs/Configuration/plugins.zh-CN.md) 等

### 三、自定义 Mrapi Server

```js
// 新建实例
const mrapi = new Mrapi({...})

// 启动服务
mrapi
  .start()
  .then(({ app, address }) => {
    app.log.info(`GraphQL Server:     ${address}/graphql`)
    app.log.info(`GraphQL Playground: ${address}/playground`)
  })
```

> ## Tips
>
> 本文档中的示例，默认情况下只监听本地 `127.0.0.1` 端口。要监听所有有效的 IPv4 端口，需要将代码修改为监听 `0.0.0.0`。
>
> 默认端口：`1358`

更多详情 [Mrapi server](./Mrapi.zh-CN.md)

### 四、验证服务

1. 以 `DEV` 模式启动应用程序

```bash
npm run start:dev
```

2. 以 `PROD` 模式启动应用程序

```bash
npm run build && npm run start:prod
```

访问 `GraphQL Server` 和 `GraphQL Playground` 地址，验证 [OpenAPI](./OpenAPI.zh-CN.md) / [GraphQL](./GraphQL-API.zh-CN.md) 接口。

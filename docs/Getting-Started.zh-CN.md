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

我们内置了 [create-mrapi-app](https://github.com/mrapi-js/create-mrapi-app) 库，方便大家快速初始化项目。

这里以最简单的 DAL 项目为例（[查看更新](https://github.com/mrapi-js/create-mrapi-app)）：

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

查看配置 [config/mrapi.config.js](./docs/Configuration/common.zh-CN.md)

### 三、自定义 prisma schema

如：

```prisma
# one.prisma

model User {
  email String  @unique
  id    Int     @default(autoincrement()) @id
  name  String?
  Post  Post[]
}

model Post {
  authorId  Int?
  content   String?
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
  User      User?   @relation(fields: [authorId], references: [id])
}
```

### 四、运行项目

首先编译依赖项文件

```
npx mrapi generate --name one
```

开发者环境运行

```
npx ts-node-dev --respawn --transpile-only ./src/app.ts
```

# CLI

[@mrapi/cli](https://github.com/mrapi-js/mrapi)

## 安装

```bash
npm install @mrapi/cli --save-dev
```

## 如何使用

`@mrapi/cli` 为 mrapi 项目提供一个命名行界面：

```bash
$ mrapi
```

将打印帮助:

<!-- 新版本发布后，命令需要更新 -->

```
Usage: mrapi [options] [command]

Options:
  -v, --version                     output the version number
  -h, --help                        display help for command

Commands:
  generate [command]                Generate prisma schema and resolvers
  migrate [options]                 Create a database migration (save|up|down)
  studio [options]                  Start database management ui (default port: 5555)
  introspect [options]              Get the datamodel of your database
  dev                               dev
  help [command]                    display help for command
```

### generate

此命令大致做了以下几件事：

1. 首先根据配置文件 [config/database](./Configuration/database.zh-CN.md) 和 [config/plugins](./Configuration/plugins.zh-CN.md) 生成 `schema.prisma` 以及 `.env` 文件；
2. 然后根据 `database.multiTenant` 判断租户类型：单租户（默认）、多租户；
3. 根据租户类型分别生成对应的 `Prisma Client`；

单租户直接执行 [prisma generate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#generate)，多租户使用 [prisma-multi-tenant generate](https://github.com/Errorname/prisma-multi-tenant/blob/master/docs/Complete_Documentation.md#generate)。

#### 参数选项

| 描述                                                                                  | 简短的命令 | 完整的命令 | 默认 |
| ------------------------------------------------------------------------------------- | ---------- | ---------- | ---- |
| 该 generate 命令将继续监视 schema.prisma 文件，并在文件更改时重新生成 Prisma Client。 | `-w`       | `--watch`  |      |

#### 示例

```bash
$ mrapi generate
```

### migrate

创建数据库迁移

单租户直接执行 [prisma migrate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate#prisma-migrate)，多租户使用 [prisma-multi-tenant migrate](https://github.com/Errorname/prisma-multi-tenant/blob/master/docs/Complete_Documentation.md#migrate)。

#### 参数选项

**注意:** 命令将自动添加 `--experimental`

###### _警告：Prisma Migrate 目前处于实验状态。当使用任何 prisma migrate 命令时，你需要通过--experimental 参数显式执行该功能，例如 `prisma migrate save --experimental`_

**多租户**参数说明

```bash
# 如果传递name参数，它将迁移一个租户。否则，它将对所有在管理数据源中注册的租户执行该操作。

# `--` 之后所有参数都将传递给@prisma/cli migrate。

# save如果未提供任何name参数，则该操作将使用默认的DATABASE_URL值

$ mrapi migrate save [name] -- --create-db
```

##### save

根据数据模型 data model 的更改创建新的迁移 migration。在这种情况下，它会自动记录所有更改(类似于 git diff)。所有更改仅在本地执行，而会直接改变数据库。但是，迁移记录已经写入数据库的\_Migration 表中(该表存储了项目的迁移历史记录)。

##### up

运行尚未应用到数据库的所有迁移 migration。该命令真正执行 prisma migrate save 时对数据库的所有更改。

##### down

此命令将还原数据库迁移，也就是回滚数据库更改。反过来，它会创建“compensation”迁移 migration，从而撤消之前的更改。

#### 示例

```bash
$ mrapi migrate save

$ mrapi migrate up

$ mrapi migrate down
```

### studio

数据库的可视编辑器

单租户直接执行 [prisma studio](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-studio)，多租户使用 [prisma-multi-tenant studio](https://github.com/Errorname/prisma-multi-tenant/blob/master/docs/Complete_Documentation.md#studio)。

#### 参数选项

**注意:** 命令将自动添加 `--experimental`

###### _警告：Prisma Studio 取代了 Prisma Admin，目前处于实验状态。当使用任何 prisma studio 命令时，你需要通过--experimental 参数显式执行该功能，例如 `prisma studio --experimental`_

| 描述         | 简短的命令 | 完整的命令 | 默认 |
| ------------ | ---------- | ---------- | ---- |
| 启动服务端口 |            | `--port`   | 5555 |

#### 示例

```bash
$ mrapi studio

# OR 多租户

$ mrapi studio name --port=5556
```

### introspect

内省（introspection）数据库并从中生成数据模型。基本上，它分析你(已经存在的)的数据库并自动为你创建 Prisma schema 文件。比较适合你已经有一个现有的应用程序并想开始使用 Prisma 的情况。请注意，此命令将根据你的数据库结构同步 Prisma schema 文件。这通常适用于不使用 Prisma Migrate 构建数据库的情况。

[更多详情](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#introspect)

### dev

待补充...

# CLI

[@mrapi/cli](https://github.com/mrapi-js/mrapi/tree/master/packages/cli)

## 安装

```bash
npm install @mrapi/cli --save-dev
```

## 如何使用

`@mrapi/cli` 为 mrapi 项目提供一个命名行界面：

```
npx mrapi -h
```

将打印帮助:

```
Usage: run [options] [command]

Options:
  -v, --version       output the version number
  -h, --help          display help for command

Commands:
  generate [options]  Generate prisma schema and nexus types
  help [command]      display help for command
```

## 配置项

参考 [mrapi 公共配置](./Configuration/Common.zh-CN.md)

## generate

此命令大致做了以下几件事：

1. 清除冗余目录或文件；
2. 根据目标文件生成完整的 `schema.prisma` ；
3. 初始化多租户实例，根据 `schema.prisma` 生成对应的 `prisma client` ；
4. 生成对应的 `nexus CURD` ；
5. 生成对应的 `oas CURD` ；

### 参数选项

```
npx mrapi generate -h
```

将打印帮助:


```
Usage: run generate [options]

Generate prisma schema and nexus types

Options:
  --env <path>     env filePath (default: "config/.env")
  --name <name>    Schema client name. If the name is "management", Only generate management client.
  --cnt <options>  Generate CNT params. whiteList: disableQueries,disableMutations
  --m <options>    Generate models
  --em <options>   Exclude generate models
  --eqm <options>  Exclude Queries and Mutations
  -h, --help       display help for command
```

#### name

对应 `schema` 配置的文件名，`prisma client` 唯一标识

- 必填

- 参数类型：`string`
  
- 参考值：`management` 或者 `schema` 配置文件名称

当值为

**注意:** 名称是 `management`，只生成多租户管理的 `prisma client`



### 示例

```
npx mrapi generate --name schema-name
```

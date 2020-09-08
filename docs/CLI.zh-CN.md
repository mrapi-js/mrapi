# CLI

[@mrapi/cli](https://github.com/mrapi-js/mrapi/tree/master/packages/cli)

用于辅助构建标准化的 mrapi 项目

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

将使用到 `mrapiConfig` 中以下属性：

```js
const { inputSchemaDir, schemaDir, outputDir, managementUrl } = this.mrapiConfig
```

参考 [mrapiConfig](./Configuration/Common.zh-CN.md)

## generate

用于初始化多租户管理实例，并生成 [DAL](./DAL.zh-CN.md) 需要的 `prisma client` 、 `nexus type` 、 `oas` 代码。

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

#### --name

对应 `schema` 配置的文件名，`prisma client` 唯一标识。

- 必填

- 参数类型：`string`

- 参考值：`"management"` 或者 `schema` 配置文件名称

结合 `mrapiConfig.inputSchemaDir` 找到 `prisma schema` 配置入口，与 `mrapiConfig.schemaDir` 生成 `schema.prisma` 出口路径，同时与 `mrapiConfig.outputDir` 生成 `prisma client` 地址

```ts
const inputSchemaPath = path.join(cwd, inputSchemaDir, `${name}.prisma`)
const outputSchemaPath = path.join(cwd, schemaDir, `${name}.prisma`)
const outputPath = path.join(cwd, outputDir, name)
```

**注意\:当值为 `"management"` 时，只生成多租户管理的 `prisma client`。避免值等于 `"schema"`，因为此值将预留给多租户管理表配置文件。**

#### --cnt

生成 CURD 的参数

- 非必填

- 参数类型：`string`（逗号分隔）

- 参考值：`"disableQueries"` 、`"disableMutations"`

`"disableQueries"` 表示不生成 `queries`，`"disableMutations"` 表示不生成 `mutations`。

#### --m

启用配置文件中的哪些 `model`

- 非必填

- 参数类型：`string`（逗号分隔）

为空表示启用全部 `model`

#### --em

与 `--m` 相反且互斥，表示忽略哪些 `model`

- 非必填

- 参数类型：`string`（逗号分隔）

为空表示不忽略任何 `model`

#### --eqm

哪些 `model` 同时忽略 `queries` 和 `mutations`

- 非必填

- 参数类型：`string`（逗号分隔）

为空表示不忽略任何 `model`

### 示例

```shell
# 一般用法，初始化 schema-xxx 配置文件
npx mrapi generate --name schema-xxx

# OR

# 仅初始化多租户管理（需要 prisma/schema.prisma 文件）
npx mrapi generate --name management
```

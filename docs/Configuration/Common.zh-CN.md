# mrapi.config.js 配置说明

`mrapi` 将取用环境变量 `process.env.MRAPICONFIG_PATH` 作为配置的读取路径，当环境变量不存在时默认填充 `config/mrapi.config.js` 作为地址。

## 参数说明

```ts
const defaultConfig: MrapiConfig = {
  // .env filePath
  envPath: 'config/.env',

  // management pmt db uri
  managementUrl: '',

  // input schema file to generate
  inputSchemaDir: 'config/prisma',

  // schema directory
  schemaDir: 'prisma',

  // output directory （cnt and pmt）
  outputDir: 'node_modules/.prisma-mrapi',

  // multi-tenant identification (use in HTTP Request Header)
  tenantIdentity: 'mrapi-pmt',

  // @mrapi/dal config
  dal: { ... },

  // @mrapi/api config
  api: { ... },
}
```

### managementUrl

多租户管理表的数据库连接地址

- 必填

- 参数类型：`string`

- 默认值：`""`

### inputSchemaDir

需要 mrapi 处理的 `prisma.schema` 文件的目录

- 参数类型：`string`

- 默认值：`"config/prisma"`

### schemaDir

 完备合规的 `prisma.schema` 文件的目录

- 参数类型：`string`

- 默认值：`"prisma"`

**注意\: 通过 mrapi 处理后的 inputSchemaDir 中的文件会最终输出在此目录中，文件名与源文件一致**

### outputDir

一些重要文件的统一输出目录，如：`prisma client` 、 `nexus type` 、 `oas` 等

- 参数类型：`string`

- 默认值：`"node_modules/.prisma-mrapi"`

### tenantIdentity

协议中的多租户标识 KEY

- 参数类型：`string`

- 默认值：`"mrapi-pmt"`

```ts
// 如 `HTTP` 中，设置 HEADER
{
  [tenantIdentity]: 'dev' // 将会启用 management db 中的 dev 项生成对应的租户来响应用户的请求
}
```

### envPath

`.env` 环境变量文件路径

- 参数类型：`string`

- 默认值：`"config/.env"`

**注意\: 当前不推荐使用此配置进行环境变量的设置，后续版本打算移除。**

### dal

[@mrapi/dal 配置项](./DAL.zh-CN.md)

### api

[@mrapi/api 配置项](./API.zh-CN.md)

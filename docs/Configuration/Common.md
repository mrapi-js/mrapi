## Configuration instructions:  mrapi.config.js

`Mrapi` will use the environment variable `process.env.MRAP CONFIG_PATH` as the configuration read path. When the environment variable does not exist, it will fill `config/mrapi.config.js` as the address by default.



### Parameter Description

```js
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

#### managementUrl:

Database connection address of the multi-tenant management table

+ Required
+ Type: `string`
+ Default: `""`

#### inputSchemaDir:

The directory of the `prisma.schema` file that needs to be processed by `mrapi`

+ Type: `string`
+ Default: `config/prisma`

#### schemaDir:

Complete and compliant `prisma.schema` file directory

+ Type: `string`
+ Default: `prisma`

**Note: The files in the `inputSchema Dir` processed by `mrapi `will eventually be output to this directory with the same file name as the source file.**

#### outputDir:

A unified output directory for some important files, such as: `prisma client`,  `nexus type`, ` oas`, ` etc`.

+ Type: `string`
+ Default: `"node_modules/.prisma-mrapi"`

#### tenantIdentity

Multi-tenant identification KEY in the agreement

+ Type: `string`
+ Default: `"mrapi-pmt"`

#### envPath

The file path of `.env` environment

+ Type: `string`
+ Default: `"config/.env"`

**Note: It is currently not recommended to use this configuration to set environment variables, and it is planned to be removed in subsequent versions.**

#### dal

[Configuration field of @mrapi/dal](https://github.com/mrapi-js/mrapi/blob/dev/docs/Configuration/DAL.md)

#### api

[Configuration field of @mrapi/api](https://github.com/mrapi-js/mrapi/blob/dev/docs/Configuration/API.md)


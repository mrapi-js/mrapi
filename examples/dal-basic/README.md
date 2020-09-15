# 说明

## TODO LIST

...

## 验证方式

### 运行

```shell
npm run generate

npm run dev
```

### 下面以访问 `one.prisma` 为例：

访问 http://0.0.0.0:1358/graphql/one

设置租户标识请求头参数 `{[config.tenantIdentity]: "name"}` 例如：`{"mrapi-pmt": "dev"}`

```graphql
query {
  users {
    id
    name
  }
}

mutation {
  createOneUser(data: {email: "xxx", name: "xxx"}) {
    id
  }
}
```

### 验证 stop / addSchema / removeSchema

查看 app.js 代码...


## 注意事项！

如果数据库使用的是 `sqlite`，管理表中的路径为相对 /prisma 目录的相对路径

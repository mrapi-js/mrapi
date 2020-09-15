# 说明

## TODO LIST

...

## 验证方式

### 运行

- 数据库准备: mysql 创建两个库management/mrapi,根据prisma-multi-tenant和prisma/one.prisma分别初始化两个库
- npm run dev
- visite [playground](http://localhost:1358/playground)
- graphql使用：${domain}/graphql/${schemaName}
```graphql
// http://localhost:1358/graphql/one
query users{
  users{
    name
  }
}
```
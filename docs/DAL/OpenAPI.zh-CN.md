# @mrapi/dal OpenAPI 说明文档

详情访问 oas swagger `/api/<schemaName>/swagger`

以下仅做特别说明

## API

### get -> /api/users

对应于 `prisma.findMany`

通过参数获取数据列表

#### where

- 参数类型：`string`

将所有模型字段包装在类型中，以便可以由任何属性筛选列表。逗号分隔

```ts
// 白名单列表
export const FILTERING = [
  'equals',
  'not',
  'in',
  'not_in',
  'lt',
  'lte',
  'gt',
  'gte',
  'contains',
  'not_contains',
  'starts_with',
  'not_starts_with',
  'ends_with',
  'not_ends_with',
]
```

**注意\: 需要 Encode 编码，因为属性间用 “,” 分隔，值也是用 “,” 分隔。**

如：`id_in:${encode(1,2,3)},name:test`

#### orderBy

- 参数类型：`string`

允许按任何属性对返回的列表排序，逗号分隔

如：`name:asc,id:desc`

#### skip

- 参数类型：`Int (>= 0)`

指定应该跳过列表中返回的对象的数量

#### take

- 参数类型：`Int (>= 1)`

指定在列表中应该返回多少个对象(从列表的开始(+ve 值)或结束(-ve 值)或从光标位置(如果提到)看到)

#### cursor

- 参数类型：`string (<key>:<value>)`

指定列表的位置(该值通常指定一个 id 或另一个惟一值)，当前只能有一个属性

如：`id:xxxx`

#### select（优化中）

指定返回对象上包含哪些属性

如：`id,name`

#### include（优化中）

指定应该在返回的对象上快速加载哪些关系

如：`Post`

### post -> /api/users

对应于 `prisma.create`

创建一条数据

### get -> /api/users/{id}

对应于 `prisma.findOne`

通过唯一标识查询数据

### put -> /api/users/{id}

对应于 `prisma.update`

通过唯一标识修改数据

### delete -> /api/users/{id}

对应于 `prisma.delete`

通过唯一标识删除数据

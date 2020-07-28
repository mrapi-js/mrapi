# OpenAPI (RESTFul API)

## 准备工作

- 在 `config/plugins.js` 中启用 `builtIn:openapi`

## 方法

- `findMany` => `[GET] /api/users`
  - 过滤: `/api/users?name_contains=s`
  - 选择字段: `/api/users?select=id,name`
  - 选择关系: `/api/users?include=roles`
  - 排序: `/api/users?orderBy=createdAt:desc`
  - 分页: `/api/users?first=5&skip=5`
- `findOne` =>`[GET] /api/users/:id`
  - 选择字段: `/api/users/:id?select=id,name`
  - 选择关系: `/api/users/:id?include=roles`
- `create` => `[POST] /api/users`, data: `{"name":"echo","password":"666666"}`
  - 选择字段: `/api/users?select=id,name`
  - 选择关系: `/api/users?include=roles`
- `update` => `[PUT] /api/users/:id`, data: `{"email": "echo@qq.com"}`
  - 选择字段: `/api/users/:id?select=id,name`
  - 选择关系: `/api/users/:id?include=roles`
- `delete` => `[DELETE] /api/users/:id`

## 查询过滤器

- `_equals`: String, 示例： `name=str`
- `_not`: String, 示例： `name_not=str`
- `_in`: String, 示例： `name_in=str1,str2`
- `_notIn`: String, 示例： `name_notIn=str1,str2`
- `_lt`: String, 示例： `name_lt=str`
- `_lte`: String, 示例： `name_lte=str`
- `_gt`: String, 示例： `name_gt=str`
- `_gte`: String, 示例： `name_gte=str`
- `_contains`: String, 示例： `name_contains=str`
- `_startsWith`: String, 示例： `name_startsWith=str`
- `_endsWith`: String, 示例： `name_endsWith=str`
- 完整示例： `/api/users?name_contains=str`

## 选择字段 (**`include` 或者 `select`, 且不能同时使用！**)

- `select`: String, 示例： `select=id,name`, 只返回 `id` 和 `name` 字段
- `include`: String, 示例： `include=roles`, 包含 `roles` 关系数据
- 完整示例： `/api/users?select=id`

## 自定义的 API

在 `config/plugins.js` 中配置路径 `builtIn:openapi.options.custom.path`

```ts
// src/openapi/index.ts
import { Context } from '@mrapi/core'

export default [
  {
    method: 'GET',
    url: `/test`,
    async handler ({ app, request, reply, prisma }: Context) {
      reply.send({
        code: 0,
        data: await prisma.user.findMany(),
      })
    },
  },
]
```

# RESTFul API

## Setup

- enable `builtIn:openapi` in `config/plugins.js`

## Methods

- `findMany` => `[GET] /api/users`
  - Filtering: `/api/users?name_contains=s`
  - Selecting fields: `/api/users?select=id,name`
  - Selecting relation: `/api/users?include=roles`
  - Sorting: `/api/users?orderBy=createdAt:desc`
  - Pagination: `/api/users?first=5&skip=5`
- `findOne` =>`[GET] /api/users/:id`
  - Selecting fields: `/api/users/:id?select=id,name`
  - Selecting relation: `/api/users/:id?include=roles`
- `create` => `[POST] /api/users`, data: `{"name":"echo","password":"666666"}`
  - Selecting fields: `/api/users?select=id,name`
  - Selecting relation: `/api/users?include=roles`
- `update` => `[PUT] /api/users/:id`, data: `{"email": "echo@qq.com"}`
  - Selecting fields: `/api/users/:id?select=id,name`
  - Selecting relation: `/api/users/:id?include=roles`
- `delete` => `[DELETE] /api/users/:id`

## Query filters

- `_equals`: String, Example: `name=str`
- `_not`: String, Example: `name_not=str`
- `_in`: String, Example: `name_in=str1,str2`
- `_notIn`: String, Example: `name_notIn=str1,str2`
- `_lt`: String, Example: `name_lt=str`
- `_lte`: String, Example: `name_lte=str`
- `_gt`: String, Example: `name_gt=str`
- `_gte`: String, Example: `name_gte=str`
- `_contains`: String, Example: `name_contains=str`
- `_startsWith`: String, Example: `name_startsWith=str`
- `_endsWith`: String, Example: `name_endsWith=str`
- Full example: `/api/users?name_contains=str`

## Selecting fields (**use `include` or `select`, but not both at the same time**)

- `select`: String, Example: `select=id,name`, only return `id` and `name` fields
- `include`: String, Example: `include=roles`, including `roles` relation data
- Full example: `/api/users?select=id`

## Custom APIs

path config: `config/plugins.js` => `builtIn:openapi.options.custom.path`

```ts
// src/openapi/index.ts
import { Context } from "@mrapi/core";

export default [
  {
    method: "GET",
    url: `/test`,
    async handler({ app, request, reply, prisma }: Context) {
      reply.send({
        code: 0,
        data: await prisma.user.findMany()
      });
    }
  }
];
```

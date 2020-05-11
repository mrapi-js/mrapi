# mrapi (WIP)

## Features

- **TypeScript**: write GraphQL APIs based on [TypeGraphQL](https://github.com/MichalLytek/type-graphql)
- **Code generation**: Generate basic CRUD APIs with [Prisma 2](https://github.com/prisma/prisma) & [typegraphql-prisma](https://www.npmjs.com/package/typegraphql-prisma)
- **Database toolkit**: execute database introspection and migrations via [Prisma 2 CLI](https://github.com/prisma/prisma/blob/master/src/packages/cli/README.md)
- **Supported databases**: PostgreSQL, MySQL, and SQLite.

## Getting Started

### Requirements

**Node:**

- NodeJS >= 10.x
- NPM >= 6.x

**Database:**

- MySQL >= 5.6
- PostgreSQL >= 10
- SQLite >= 3

### Installation

create a Mrapi project

```bash
yarn create mrapi-app my-project
```

**or**

```bash
npx create-mrapi-app my-project
```

### Run

```bash
yarn dev
```

## APIs

- ### GraphQL API (default)
- ### RESTFul API

  - Setup

    - add `config/rest.js` with content:

      ```js
      module.exports = {
        enable: true,
        prefix: "/api",
        schema: {
          User: ["findOne", "findMany", "create", "update"],
          Role: ["findMany"],
        },
      };
      ```

    - update `src/app.ts` with:

      ```js
      const mrapi = new Mrapi({
        config: {
          ...
          rest: require('../config/rest'),
        },
      }
      ```

  - Methods
    - `GET`: `http://127.0.0.1:1358/api/users`
    - `GET`: `http://127.0.0.1:1358/api/users?name_contains=s`
    - `GET`: `http://127.0.0.1:1358/api/users/{id}`
    - `POST`: `http://127.0.0.1:1358/api/users`, data: `{"name":"echo","password":"666666"}`
    - `PUT`: `http://127.0.0.1:1358/api/users/{id}`, data: `{"email": "echo@qq.com"}`
    - `DELETE`: `http://127.0.0.1:1358/api/users/{id}`
  - Query filters
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
    - Full example: `http://127.0.0.1:1358/api/users?name_contains=str`
  - Selecting fields (**use `include` or `select`, but not both at the same time**)
    - `select`: String, Example: `select=id,name`, only return `id` and `name` fields
    - `include`: String, Example: `include=Role`, including `Role` data
    - Full example: `http://127.0.0.1:1358/api/users?select=id`

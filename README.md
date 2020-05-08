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

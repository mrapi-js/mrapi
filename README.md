# mrapi (WIP)

[简体中文](./README.zh-CN.md)

## Core features

- **TypeScript**: write GraphQL APIs based on [TypeGraphQL](https://github.com/MichalLytek/type-graphql)
- **Code generation**: Generate basic CRUD APIs with [Prisma 2](https://github.com/prisma/prisma) & [typegraphql-prisma](https://www.npmjs.com/package/typegraphql-prisma)
- **Database toolkit**: execute database introspection and migrations via [Prisma 2 CLI](https://github.com/prisma/prisma/blob/master/src/packages/cli/README.md)
- **Supported databases**: PostgreSQL, MySQL, and SQLite.

## Requirements

**Node:**

- NodeJS >= 10.x
- NPM >= 6.x

**Database:**

- MySQL >= 5.6
- PostgreSQL >= 10
- SQLite >= 3

## Quick start

Create a Mrapi project

```bash
yarn create mrapi-app my-project

# or
npx create-mrapi-app my-project

# or
pnpx create-mrapi-app my-project
```

To start the app in dev mode:

```bash
npm start
```

## Documentation

- [ ] [Getting Started](./docs/Getting-Started.md)
- [ ] [Mrapi](./docs/Mrapi.md)
- [ ] Configuration
  - [ ] [database](./docs/Configuration/database.md)
  - [ ] [plugins](./docs/Configuration/plugins.md)
- [ ] [GraphQL API](./docs/GraphQL-API.md)
- [x] [OpenAPI](./docs/OpenAPI.md)
- [ ] [CLI](./docs/CLI.md)
- [ ] [Deployment](./docs/Deployment.md)

## License

Licensed under [MIT](./LICENSE).

<p align="center">
  <a href="https://mrapi-js.github.io/docs/" target="_blank" rel="noopener noreferrer"><img width="200" src="./assets/logo.png" alt="mrapi logo"></a>
</p>

mrapi is a framework for rapid development of API or DAL applications.

[Website](https://mrapi-js.github.io/docs/)

## Overview

Hello! Thank you for checking out Mrapi!
Mrapi is a lightweight, out-of-the-box, nodejs server framework, Born for construction
Use Node.js and Koa for better enterprise frameworks and applications

Born to build enterprise-level nodejs applications faster

## Core features

- Easier to use
- Automation
- Flexible and Extendible
- Highly performant
- TypeScript Support

Let's start!

## Requirements

**Node:**

- NodeJS >= 10.x
- NPM >= 6.x

**Database:**

- MySQL >= 5.6
- PostgreSQL >= 10
- SQLite >= 3

## Quick start

### Frist step：create a mrapi project

As a first step, create a project directory and navigate into it:

```terminal
$  mkdir hello-mrapi
$  cd hello-mrapi
```

Next, run the following command: will automatically create a folder and install dependencies

```terminal
$  yarn create-mrapi-app my-project

# or
$  npx create-mrapi-app my-project

# or
$  pnpx create-mrapi-app my-project
```

And now, the project has been generated!

### Second step: Modify the configuration file

View configuration：[config/mrapi.config.js](https://mrapi-js.github.io/docs/Configuration/Common.html)

### Third step: customize mrapi server

such as:

```prisma
# one.prisma

model User {
  email String  @unique
  id    Int     @default(autoincrement()) @id
  name  String?
  Post  Post[]
}

model Post {
  authorId  Int?
  content   String?
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
  User      User?   @relation(fields: [authorId], references: [id])
}

```

### Fourth, Run the project

First compile the dependency file

```terminal
npx mrapi generate --name one
```

Run in developer environment

```termianl
npx ts-node-dev --respawn --transpile-only ./src/app.ts
```

## Documentation

You can find the Mrapi documentation on the [website](https://mrapi-js.github.io/docs/).

- [x] [Getting Started](https://mrapi-js.github.io/docs/GettingStart.html)
- [x] Configuration
  - [x] [common](https://mrapi-js.github.io/docs/Configuration/Common.html)
  - [x] [@mrapi/dal](https://mrapi-js.github.io/docs/Configuration/DAL.html)
  - [x] [@mrapi/api](https://mrapi-js.github.io/docs/Configuration/API.html)
- [x] [CLI](https://mrapi-js.github.io/docs/CLI.html)
- [x] [DAL](https://mrapi-js.github.io/docs/DAL/DAL.html)
  - [x] [GraphQL API](https://mrapi-js.github.io/docs/DAL/GraphQl-API.html)
  - [x] [OpenAPI](https://mrapi-js.github.io/docs/DAL/OpenAPI.html)
- [x] [API](https://mrapi-js.github.io/docs/API.html)
- [x] [Examples](https://mrapi-js.github.io/docs/Examples.html)
- [x] [Deployment](https://mrapi-js.github.io/docs/Deployment.html)

## License

Licensed under [MIT](./LICENSE).

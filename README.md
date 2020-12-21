<p align="center">
  <a href="https://mrapi-js.github.io/docs/" target="_blank" rel="noopener noreferrer"><img width="200" src="./assets/logo.png" alt="mrapi logo"></a>
</p>

Application framework for [node](https://nodejs.org/).

## Requirements

**Node:**

- NodeJS >= 10.x
- NPM >= 6.x

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
npx mrapi generate --services one
```

Run in developer environment

```termianl
npx ts-node-dev --respawn --transpile-only ./src/app.ts
```bash
npx fbi create factory-node
```

## Main packages

- [@mrapi/app](./packages/app/README.md)
- [@mrapi/service](./packages/service/README.md)
- [@mrapi/gateway](./packages/gateway/README.md)

## Contribute to Mrapi

Please read the [guide](./CONTRIBUTING.md)
## License

Licensed under [MIT](./LICENSE).

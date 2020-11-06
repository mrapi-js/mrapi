

# Dev

```bash
yarn

npm link ../../packages/cli --legacy-peer-deps

npx mrapi setup

yarn dev
```

## Notes

- If `prisma studio` error. e.g.:
  - `error: Found argument '--enable-experimental' which wasn't expected, or isn't valid in this context. Did you mean --enable-playground?`
  - Ref: [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-studio#troubleshooting)

    ```bash
    $ rm -rf ~/.cache/prisma
    ```

## Queries

```graphql
{
  serverTime {
    time
  }
  users {
    id
    name
    email
  }
  posts {
    id
    title
  }
  me(where: { name: { contains: "s" } }) {
    id
    name
    email
  }
  draft(where: { title: { contains: "x" } }) {
    id
    title
  }
}
```

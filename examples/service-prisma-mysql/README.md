

# Dev

```bash
npm link ../../packages/cli --legacy-peer-deps

npx mrapi setup

npm run dev

# single-tenant
npx mrapi prisma generate --service=post
npx mrapi prisma migrate save --experimental --create-db --name="" --service=post
npx mrapi prisma migrate up --experimental --create-db --service=post
npx mrapi prisma db push --ignore-migrations --preview-feature --service=post

# multi-tenant
npx mrapi prisma generate --service=user
npx mrapi prisma migrate save --experimental --create-db --name="" --service=user --tenant=one
npx mrapi prisma migrate up --experimental --create-db --service=user --tenant=one
npx mrapi prisma db push --ignore-migrations --preview-feature --service=user --tenant=one

npx mrapi prisma migrate up --experimental --create-db --service=user --tenant=two
npx mrapi prisma db push --ignore-migrations --preview-feature --service=user --tenant=two
```

## Notes

- If `prisma studio` error. e.g.:
  - `error: Found argument '--enable-experimental' which wasn't expected, or isn't valid in this context. Did you mean --enable-playground?`
  - Ref: [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-studio#troubleshooting)

    ```bash
    $ rm -rf ~/.cache/prisma
    ```

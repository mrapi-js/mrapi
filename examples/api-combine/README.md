# API combined Example

## DEV Steps

**First Run**

```bash
yarn generate # generate code for mrapi

yarn migrate # migrate save & up to database

yarn dev # start server
```

**Else**

```bash
yarn dev
```

**If prisma schema have been chenged**

```bash
yarn generate

yarn migrate
```

## Set multi-tenant identity

http headers:
```json
{
  "mrapi-tenant-id": "tenant-name"
}
```

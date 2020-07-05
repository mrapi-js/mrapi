# Migration `20200630201640-init`

This migration has been generated by neikvon at 6/30/2020, 8:16:40 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."User" (
"createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP ,"email" TEXT NOT NULL DEFAULT '' ,"id" TEXT NOT NULL  ,"name" TEXT NOT NULL  ,"password" TEXT NOT NULL  ,"roleId" TEXT   ,"updatedAt" DATE NOT NULL  ,
    PRIMARY KEY ("id"),FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE)

CREATE TABLE "quaint"."Role" (
"createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP ,"id" TEXT NOT NULL  ,"name" TEXT NOT NULL  ,"updatedAt" DATE NOT NULL  ,
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "quaint"."User.name" ON "User"("name")

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200630201640-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,33 @@
+// Generated by mrapi. DO NOT modify it manually.
+datasource db {
+  provider = "sqlite"
+  url      = env("DATABASE_URL")
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+generator typegraphql {
+  provider = env("TYPE_GRAPHQL_PROVIDER")
+  output   = env("TYPE_GRAPHQL_OUTPUT")
+}
+
+model User {
+  id        String   @default(cuid()) @id
+  name      String   @unique
+  email     String   @default("")
+  password  String
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+  role      Role?    @relation(fields: [roleId], references: [id])
+  roleId    String?
+}
+
+model Role {
+  id        String   @default(cuid()) @id
+  name      String
+  users     User[]
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+}
```


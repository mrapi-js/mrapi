# Migration `20201111171135`

This migration has been generated by shawnnxiao(肖玉峰) at 11/12/2020, 1:11:35 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "email" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT
);
INSERT INTO "new_User" ("email", "id", "name", "createdAt", "updatedAt", "tenantId") SELECT "email", "id", "name", "createdAt", "updatedAt", "tenantId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201111165434..20201111171135
--- datamodel.dml
+++ datamodel.dml
@@ -4,15 +4,15 @@
 }
 datasource db {
   provider = ["sqlite", "mysql", "postgresql"]
-  url = "***"
+  url = "***"
 }
 model User {
   email     String   @unique
   id        Int      @id @default(autoincrement())
   name      String?
   createdAt DateTime @default(now())
   updatedAt DateTime @updatedAt
-  tenantId  String
+  tenantId  String?
 }
```


# Mrapi application

A quick description of your mrapi application

## config/database.json
- sqlite
  ```json
  {
    "provider": "sqlite",
    "client": "prisma",
    "url": "file:dev.db",
    "schema": "./config/schema.prisma",
    "schemaOutput": "./prisma/schema.prisma"
  }
  ```
- mysql
  ```json
  {
    "provider": "mysql",
    "client": "prisma",
    "host": "localhost",
    "port": 3306,
    "database": "marpidb",
    "user": "root",
    "password": "123456",
    "schema": "./config/schema.prisma",
    "schemaOutput": "./prisma/schema.prisma"
  }
  ```
- postgresql
  ```json
  {
    "provider": "postgresql",
    "client": "prisma",
    "host": "localhost",
    "port": 5432,
    "database": "marpidb",
    "user": "postgres",
    "password": "postgres",
    "schema": "./config/schema.prisma",
    "schemaOutput": "./prisma/schema.prisma"
  }
  ```

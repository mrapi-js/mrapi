# CLI

[mrapi](https://github.com/mrapi-js/mrapi) 命名行用于?????

## 安装
```bash
npm install @mrapi/cli --save-dev
```

## 如何使用

`@mrapi/cli` 为 mrapi 项目提供一个命名行界面：

```bash
$ mrapi
```

将打印帮助:

```
Usage: mrapi [options] [command]

Options:
  -v, --version                     output the version number
  -h, --help                        display help for command

Commands:
  generate [options]                Generate prisma schema and resolvers
  db:save [name]                    Create a migration with a specific name
  db:up [name/increment/timestamp]  Migrate the database up to a specific state
  db:ui [options]                   Start database management ui
  db:introspect                     Get the datamodel of your database
  dev                               dev
  help [command]                    display help for command
```

### create

创建 Prisma 文件（schema、env）

```bash
$ mrapi create
```

#### 参数选项
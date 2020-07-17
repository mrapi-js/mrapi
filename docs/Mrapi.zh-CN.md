# Mrapi

## 工厂类

Mrapi 模块导出了一个工厂类，可以用于创建新的 `Mrapi` 实例。这个工厂类的初始化参数是一个配置对象，用于自定义最终生成的实例。

```js
const mrapi = new Mrapi({
  server: require('../config/server'),
  database: require('../config/database'),
  plugins: require('../config/plugins'),
  hooks: {
    onRequest(request: Request, reply: Reply, done: () => void) {
      // Some code
      done()
    },
  },
})
```

本文描述了这一对象中可用的属性。

### `server`

服务器相关配置参数

- 默认值：

```json
{
  "options": {
    "logger": {
      "prettyPrint": true
    }
  },
  "listen": {
    "host": "localhost",
    "port": 1358
  }
}
```

#### options

用于初始化 `fastify` 实例，参数详情请查看 [FastifyServerOptions](https://github.com/fastify/docs-chinese/blob/master/docs/Server.md)

**注意：**

- 默认值为 `{ prettyPrint: true }`，

- `logger` 为标准的 [Pino options](https://github.com/pinojs/pino/blob/c77d8ec5ce/docs/API.md#constructor) 时，将自动附加以下参数

```js
const serializers = {
  req: function asReqValue(req: any) {
    return {
      method: req.method,
      url: req.url,
      version: req.headers['accept-version'],
      hostname: req.hostname,
      remoteAddress: req.ip,
      remotePort: req.connection.remotePort,
    }
  },
  err: pino.stdSerializers.err,
  res: function asResValue(reply: any) {
    return {
      statusCode: reply.statusCode,
    }
  },
}
```

#### listen

指定端口上启动服务器

- 值类型：`number` 或者 [ListenOptions](https://nodejs.org/api/net.html#net_server_listen_options_callback)

- 默认值端口为 `1358`

### `database`

数据库相关配置参数，详情查看 [config/database](./Configuration/database.zh-CN.md)

### `plugins`

允许用户通过插件的方式扩展自身的功能，相关配置详情 [config/plugins](./Configuration/plugins.zh-CN.md)

### `hooks`

钩子 (hooks) 让你能够监听应用或请求/响应生命周期之上的特定事件。你必须在事件被触发之前注册相应的钩子，否则，事件将得不到处理。更多详情请查看 [Fastify Hooks](https://github.com/fastify/docs-chinese/blob/master/docs/Hooks.md)

- 默认值：`{}`

**注意**：配置项中的钩子将自动调用 `.addHook(key, cb)` 进行注册。

## 实例

### 服务器方法

常规用法示例：

```js
mrapi
  .start()
  .then(({ app, address }) => {
    app.log.info(`GraphQL Server:     ${address}/graphql`)
    app.log.info(`GraphQL Playground: ${address}/playground`)
  })
  .catch((err) => {
    mrapi.app.log.error('Error starting server')
    console.error(err)
    process.exit(1)
  })
```

#### start()

启动服务

- 返回 `Promise` 对象
- 可取值为 `app`（mrapi 实例） 和 `address` （app.listen 返回值)

#### close()

关闭服务

### 其他对象

#### callbacksAfterReady

- 默认值：[]
- 类型为 `Function[]`

注册到 app.ready 后的事件触发列表

## 其他

更多方法 [Fastify API](https://github.com/fastify/docs-chinese)

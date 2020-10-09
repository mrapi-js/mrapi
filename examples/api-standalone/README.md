# 说明

## TODO LIST

...

## 验证方式

### 运行

- change the config file `config/mrapi.config.js` to the valid value
- npm run dev
- visite [playground](http://localhost:1358/playground)
```graphql
// http://localhost:1358/graphql/default
query serv_time{
  serv_time{
    time
  }
}
```

### config说明
```javascript
exports.default = {
  // @mrapi/api config
  api: {
    // serverconfig
    server: {
      // server listen port
      port: 1358, // default
      // @mrapi/api runtime type
      type: 'standalone', // default
      // options of fastify
      options: {},
    },
    // openapi service config
    openapi: {
      // custome openapi dir
      dir: '/src/openapi', // default
      // dal service openapi base url
      dalBaseUrl: 'http://localhost', // should be replaced
      // custome openapi prefix
      prefix: '/api', // default
    },
    // graphql service config
    graphql: {
      // custome graphql dir
      dir: '/src/graphql', // default
      // mesh graphql source 
      sources: [
        {
          name: 'auth',
          endpoint: 'http://localhost:4003/graphql', // should be replaced
          prefix: 'auth_',
          snapshot: false,
        },
      ],
    },
  }
}

```

# @mrapi/dal 配置项

 当前配置仅提供给 `@mrapi/dal` 使用。

**注意\: 请先查看 [mrapi 整体配置项说明](./Common.zh-CN.md)**

## 参数说明

```ts
  // @mrapi/dal config
  dal: {
    // In the event of a multi-tenant exception, whether or not an error is thrown.
    pmtErrorThrow: false,

    // Remove routes of the same name before adding them.
    enableRepeatRoute: true,
  }
```

### pmtErrorThrow

当多租户读取发生异常的时候，是否抛出异常

- 参数类型：`boolean`

- 默认值：`false`

**注意\: 默认 false 是为了确保在请求协议中未设置 tenantIdentity 时候也能够正常访问 GraphQL 文档**

### enableRepeatRoute

是否允许添加重复标识的服务器路由

- 参数类型：`boolean`

- 默认值：`true`

**注意\: 允许重复添加时，在添加前会执行删除路由的逻辑**

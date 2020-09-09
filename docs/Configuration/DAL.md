## configuration of @mrapi/dal

**The current configuration is only available for `@mrapi/dal`**

Note: Please read [mrapi overall configuration description](https://github.com/mrapi-js/mrapi/blob/dev/docs/Configuration/Common.md) first

### Parameter Description

```js
  // @mrapi/dal config
  dal: {
    // In the event of a multi-tenant exception, whether or not an      		error is thrown.
    pmtErrorThrow: false,

    // Remove routes of the same name before adding them.
    enableRepeatRoute: true,
  }
```

#### pmtErrorThrow

When an exception occurs in multi-tenant reading, whether an exception is thrown

+ Type: `boolean`
+ Default: `false`

**Note: The default false is to ensure that the GraphQL document can be accessed normally when the tenantIdentity is not set in the request protocol**

#### enableRepeatRoute

Whether to allow adding duplicate server routes

+ Type: `boolean`
+ Default: `true`

**Note: When the enableRepeatRoute is true, the logic of deleting the route will be executed before adding**


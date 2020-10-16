module.exports = {
  "sources": [
    {
      "name": "blog",
      "handler": {
        "graphql": {
          "endpoint": "http://localhost:1358/graphql",
          "operationHeaders": {
            "mrapi-tenant-id": "{context.tenant}"
          }
        }
      }
    }
  ],
  "transforms": [],
  "serve": {
    "exampleQuery": "/Users/shaw/work/github/mrapi-js/mrapi/examples/api-combine/examples/users.graphql"
  }
}
    
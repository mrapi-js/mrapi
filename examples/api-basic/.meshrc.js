module.exports = {
  "sources": [
    {
      "name": "Blog",
      "handler": {
        "graphql": {
          "endpoint": "http://localhost:1358/graphql",
          "operationHeaders": {
            "mrapi-tenant-id": "{context.tenant}"
          }
        }
      },
      "transforms": [
        {
          "resolversComposition": [
            {
              "resolver": "*.*",
              "composer": "/Users/shaw/work/github/mrapi-js/mrapi/examples/api-basic/src/graphql/middlewares/openapi"
            }
          ]
        }
      ]
    }
  ],
  "transforms": [],
  "serve": {
    "exampleQuery": "/Users/shaw/work/github/mrapi-js/mrapi/examples/api-basic/examples/users.graphql"
  }
}
    
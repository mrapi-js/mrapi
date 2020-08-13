
  module.exports = {
    sources: [{"name":"auth","handler":{"graphql":{"endpoint":"http://localhost:1358/graphql"}},"transforms":[{"prefix":{"includeRootOperations":true,"value":"auth_"}}]}]
  }
  
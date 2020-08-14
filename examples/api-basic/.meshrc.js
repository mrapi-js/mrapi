
  module.exports = {
    sources: [{"name":"auth","handler":{"graphql":{"endpoint":"http://localhost:4003/graphql"}},"transforms":[{"prefix":{"includeRootOperations":true,"value":"auth_"}}]}]
  }
  
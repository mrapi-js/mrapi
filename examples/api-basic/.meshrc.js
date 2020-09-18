
  module.exports = {
    sources: [{"name":"weather","handler":{"openapi":{"source":"https://api.apis.guru/v2/specs/mashape.com/geodb/1.0.0/swagger.json","operationHeaders":{"X-RapidAPI-Key":"f93d3b393dmsh13fea7cb6981b2ep1dba0ajsn654ffeb48c26"}}},"transforms":[{"prefix":{"includeRootOperations":true,"value":"weather_"},"snapshot":{"if":"process.env.NODE_ENV != \"production\"","apply":["Query.*","Mutation.*"],"outputDir":"__snapshots__"}}]},{"name":"auth","handler":{"graphql":{"endpoint":"http://106.52.61.221:30141/graphql","operationHeaders":{}}},"transforms":[{"prefix":{"includeRootOperations":true,"value":"auth_"},"snapshot":{"if":"process.env.NODE_ENV != \"production\"","apply":["Query.*","Mutation.*"],"outputDir":"__snapshots__"}}]}]
  }
  
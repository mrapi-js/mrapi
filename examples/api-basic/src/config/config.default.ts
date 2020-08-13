export default {
  server: {
    port: 1358,
    type: 'standalone',
  },
  graphqlDir: '/src/graphql',
  openapiDir: '/src/openapi',
  sources: [
    {
      name: 'auth',
      endpoint: 'http://42.194.188.88:1358/graphql', // should be replaced
      prefix: 'auth_',
      snapshot: false,
    },
  ],
}

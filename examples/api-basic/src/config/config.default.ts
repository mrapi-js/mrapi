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
      endpoint: 'http://localhost:1358/graphql', // should be replaced
      prefix: 'auth_',
      snapshot: false,
    },
  ],
}

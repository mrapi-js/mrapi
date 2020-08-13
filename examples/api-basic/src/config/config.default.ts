export default {
  server: {
    port: 1358,
    type: 'standalone',
  },
  sources: [
    {
      name: 'auth',
      endpoint: 'http://localhost:4003/graphql', // should be replaced
      prefix: 'auth_',
      snapshot: false,
    },
  ],
}

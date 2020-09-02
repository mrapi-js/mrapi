exports.default = {
  Error: {
    additionalProperties: true
  },
  User: {
    type: 'object',
    properties: {
      email: {
        description: 'email',
        type: 'string'
      },
      id: {
        description: 'id',
        type: 'integer'
      },
      name: {
        description: 'name',
        type: 'string'
      }
      // Post: {
      // }
    },
    required: ['email', 'id']
  },
  Post: {
    type: 'object',
    properties: {
      content: {
        description: 'content',
        type: 'string'
      },
      authorId: {
        description: 'authorId',
        type: 'integer'
      },
      id: {
        description: 'id',
        type: 'integer'
      },
      title: {
        description: 'title',
        type: 'string'
      },
      published: {
        description: 'published',
        type: 'boolean'
      }
      // User: {
      // }
    },
    required: ['id', 'published', 'title']
  }
}

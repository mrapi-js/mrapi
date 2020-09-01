exports.default = {
  World: {
    type: 'object',
    properties: {
      name: {
        description: 'The name of this world.',
        type: 'string'
      }
    },
    required: ['name']
  }
}

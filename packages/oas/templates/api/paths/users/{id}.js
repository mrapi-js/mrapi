exports.default = function (getPrisma) {
  async function GET (req, res, next) {
    const prisma = await getPrisma(req)
    const data = await prisma.user.findMany()
    res.status(200).json(data)
  }
  GET.apiDoc = {
    description: 'Query the user by parameter.',
    operationId: 'getUser',
    tags: ['users'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'id'
      }
    ],
    responses: {
      200: {
        description: 'The user information',
        schema: {
          $ref: '#/definitions/User'
        }
      },

      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function PUT (req, res, next) {
    const prisma = await getPrisma(req)
    const data = await prisma.user.findMany()
    res.status(500).json(data)
  }
  PUT.apiDoc = {
    description: 'Update a user.',
    operationId: 'createUser',
    tags: ['users'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'id'
      },
      {
        name: 'user',
        in: 'body',
        schema: {
          $ref: '#/definitions/User'
        }
      }
    ],
    responses: {
      200: {
        description: 'User updated successfully.',
        schema: {
          $ref: '#/definitions/User'
        }
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function DELETE (req, res, next) {
    const prisma = await getPrisma(req)
    const data = await prisma.user.findMany()
    res.status(500).json(data)
  }
  DELETE.apiDoc = {
    description: 'Delete user.',
    operationId: 'deleteUser',
    tags: ['users'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'id'
      }
    ],
    responses: {
      204: {
        description: 'User deleted successfully.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return {
    GET,
    PUT,
    DELETE
  }
}

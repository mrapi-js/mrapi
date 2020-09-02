exports.default = function (getPrisma) {
  async function GET (req, res, next) {
    const prisma = await getPrisma(req)
    const data = await prisma.user.findMany()
    res.status(200).json(data)
  }
  GET.apiDoc = {
    description: 'Query the users by parameter.',
    operationId: 'getUsers',
    tags: ['users'],
    parameters: [
      // {
      //   name: 'user',
      //   in: 'query',
      //   schema: {
      //     $ref: '#/definitions/User'
      //   }
      // }
    ],
    responses: {
      200: {
        description: 'The list of users that match the parameters.',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/User'
          }
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

  async function POST (req, res, next) {
    const prisma = await getPrisma(req)
    const data = await prisma.user.findMany()
    res.status(500).json(data)
  }
  POST.apiDoc = {
    description: 'Create new users.',
    operationId: 'createUsers',
    tags: ['users'],
    parameters: [
      {
        name: 'data',
        in: 'body',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/User'
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'Users created successfully.',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/User'
          }
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
    description: 'Delete users.',
    operationId: 'deleteUsers',
    tags: ['users'],
    parameters: [],
    responses: {
      204: {
        description: 'Users deleted successfully.'
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
    POST,
    DELETE
  }
}

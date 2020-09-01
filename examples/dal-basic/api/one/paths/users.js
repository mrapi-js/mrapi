exports.default = function (getPrisma) {
  const operations = {
    GET
  }

  async function GET (req, res, next) {
    const prisma = await getPrisma(req)
    const data = await prisma.user.findMany()
    res.status(200).json(data)
  }

  GET.apiDoc = {
    summary: 'Returns worlds by name.',
    operationId: 'getWorlds',
    parameters: [
      {
        in: 'query',
        name: 'worldName',
        required: true,
        type: 'string'
      }
    ],
    responses: {
      200: {
        description: 'A list of worlds that match the requested name.',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/World'
          }
        }
      },
      default: {
        description: 'An error occurred',
        schema: {
          additionalProperties: true
        }
      }
    }
  }

  return operations
}

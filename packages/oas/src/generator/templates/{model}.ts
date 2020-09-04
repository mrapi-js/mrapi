export const modelTmpFn = {
  GET: (parameters: any, data: any) => `async function GET (req, res, next) {
    const data = await mrapiFn.findOne(req, res, next, {
      modelName: '${data.modelName}'
    });
    res.status(200).json(data);
  };
  GET.apiDoc = {
    description: 'Query the ${data.modelName} by parameter.',
    operationId: 'get${data.name}',
    tags: ['${data.plural}'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'id',
      }, 
      ${parameters.where} // WhereUniqueInput
      ${parameters.select}
      ${parameters.include}
    ],
    responses: {
      200: {
        description: 'The ${data.modelName} information',
        schema: {
          $ref: '#/definitions/${data.name}',
        },
      },
      #{TMP_DEFAULT_RESPONSE}
    },
  };`,

  PUT: (parameters: any, data: any) => `async function PUT(req, res, next) {
    const data = await mrapiFn.update(req, res, next, {
      modelName: '${data.modelName}'
    });
    res.status(204).json(data);
  };
  PUT.apiDoc = {
    description: 'Update a ${data.modelName}.',
    operationId: 'create${data.name}',
    tags: ['${data.plural}'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'id',
      },
      // {
      //   name: 'user',
      //   in: 'body',
      //   schema: {
      //     $ref: '#/definitions/User',
      //   },
      // },
    ],
    responses: {
      204: {
        description: '${data.name} updated successfully.',
        schema: {
          $ref: '#/definitions/${data.name}',
        },
      },
      #{TMP_DEFAULT_RESPONSE}
    },
  };`,

  DELETE: (
    parameters: any,
    data: any,
  ) => `async function DELETE(req, res, next) {
    const data = await mrapiFn.delete(req, res, next, {
      modelName: '${data.modelName}'
    });
    res.status(204).json(data);
  };
  DELETE.apiDoc = {
    description: 'Delete ${data.modelName}.',
    operationId: 'delete${data.name}',
    tags: ['${data.plural}'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'id',
      },
    ],
    responses: {
      204: {
        description: '${data.name} deleted successfully.',
      },
      #{TMP_DEFAULT_RESPONSE}
    },
  };`,
}

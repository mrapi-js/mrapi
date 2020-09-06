export const modelTmpFn = {
  GET: (
    _parameters: any,
    data: any,
    parameterId: string,
  ) => `async function GET (req, res, next) {
    const data = await mrapiFn.findOne(req, res, next, {
      modelName: '${data.modelName}'
    });
    if (data.code === 0) {
      res.status(200).json(data);
    } else {
      res.status(500).json(data);
    }
  };
  GET.apiDoc = {
    description: 'Query the ${data.modelName} by parameter.',
    operationId: 'getOne${data.name}',
    tags: ['${data.plural}'],
    parameters: [
      ${parameterId}
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

  PUT: (
    _parameters: any,
    data: any,
    parameterId: string,
  ) => `async function PUT(req, res, next) {
    const data = await mrapiFn.update(req, res, next, {
      modelName: '${data.modelName}'
    });
    if (data.code === 0) {
      res.status(204).json(data);
    } else {
      res.status(500).json(data);
    }
  };
  PUT.apiDoc = {
    description: 'Update a ${data.modelName}.',
    operationId: 'updateOne${data.name}',
    tags: ['${data.plural}'],
    parameters: [
      ${parameterId}
      {
        name: 'data',
        in: 'body',
        schema: {
          $ref: '#/definitions/${data.name}CreateInput'
        },
        required: true,
      },
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
    _parameters: any,
    data: any,
    parameterId: string,
  ) => `async function DELETE(req, res, next) {
    const data = await mrapiFn.delete(req, res, next, {
      modelName: '${data.modelName}'
    });
    if (data.code === 0) {
      res.status(200).json(data);
    } else {
      res.status(500).json(data);
    }
  };
  DELETE.apiDoc = {
    description: 'Delete ${data.modelName}.',
    operationId: 'deleteOne${data.name}',
    tags: ['${data.plural}'],
    parameters: [
      ${parameterId}
    ],
    responses: {
      200: {
        description: '${data.name} deleted successfully.',
      },
      #{TMP_DEFAULT_RESPONSE}
    },
  };`,
}

export const modelsTmpFn = {
  GET: (parameters: any, data: any) => `async function GET (req, res, next) {
    const data = await mrapiFn.findMany(req, res, next, {
      modelName: '${data.modelName}'
    });
    if (data.code === 0) {
      res.status(200).json(data);
    } else {
      res.status(500).json(data);
    }
  };
  GET.apiDoc = {
    description: 'Query the ${data.plural} by parameter.',
    operationId: 'get${data.name}s',
    tags: ['${data.plural}'],
    parameters: [
      ${parameters.where}
      ${parameters.orderBy}
      ${parameters.skip}
      ${parameters.take}
      ${parameters.cursor}
      ${parameters.select}
      ${parameters.include}
    ],
    responses: {
      200: {
        description: 'The list of ${data.plural} that match the parameters.',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/${data.name}'
          }
        }
      },
      #{TMP_DEFAULT_RESPONSE}
    }
  };`,

  POST: (parameters: any, data: any) => `async function POST (req, res, next) {
    const data = await mrapiFn.create(req, res, next, {
      modelName: '${data.modelName}'
    });
    if (data.code === 0) {
      res.status(204).json(data);
    } else {
      res.status(500).json(data);
    }
  };
  POST.apiDoc = {
    description: 'Create a new ${data.plural}.',
    operationId: 'create${data.name}',
    tags: ['${data.plural}'],
    parameters: [
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
        description: '${data.modelName} created successfully.',
        schema: {
          $ref: '#/definitions/${data.name}'
        }
      },
      #{TMP_DEFAULT_RESPONSE}
    }
  };`,

  // DELETE: (
  //   _parameters: any,
  //   data: any,
  // ) => `async function DELETE (req, res, next) {
  //   const data = await mrapiFn.deleteMany(req, res, next, {
  //     modelName: "${data.modelName}"
  //   });
  //   if (data.code === 0) {
  //     res.status(200).json(data);
  //   } else {
  //     res.status(500).json(data);
  //   }
  // };
  // DELETE.apiDoc = {
  //   description: 'Delete ${data.plural}.',
  //   operationId: 'delete${data.name}s',
  //   tags: ['${data.plural}'],
  //   parameters: [
  //     {
  //       name: 'data',
  //       in: 'body',
  //       schema: {
  //         type: 'array',
  //         items: {
  //           type: "string",
  //           default: "id"
  //         },
  //       },
  //       required: true,
  //     },
  //   ],
  //   responses: {
  //     200: {
  //       description: '${data.name}s deleted successfully.'
  //     },
  //     #{TMP_DEFAULT_RESPONSE}
  //   }
  // };`,
}

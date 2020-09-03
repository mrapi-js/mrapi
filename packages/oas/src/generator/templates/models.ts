import { SORTING } from '../../constants'

export const modelsTmpFn = {
  GET: (data: any) => `async function GET (req, res, next) {
    const data = await mrapiFn.findMany(req, res, next, {
      modelName: '${data.modelName}'
    });
    res.status(200).json(data);
  };
  GET.apiDoc = {
    description: 'Query the ${data.plural} by parameter.',
    operationId: 'get${data.name}s',
    tags: ['${data.plural}'],
    parameters: [
      {
        name: '${SORTING}',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Lets you order the returned list by any property.',
      },
      {
        name: 'skip',
        in: 'query',
        type: 'integer',
        required: false,
        description: 'Specifies how many of the returned objects in the list should be skipped.',
      },
      {
        name: 'take',
        in: 'query',
        type: 'integer',
        required: false,
        description: 'Specifies how many objects should be returned in the list (as seen from the beginning (+ve value) or end (-ve value) either of the list or from the cursor position if mentioned)',
      },
      {
        name: 'cursor',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Specifies the position for the list (the value typically specifies an id or another unique value).',
      },
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

  POST: (data: any) => `async function POST (req, res, next) {
    const data = await mrapiFn.create(req, res, next, {
      modelName: '${data.modelName}'
    });
    res.status(204).json(data);
  };
  POST.apiDoc = {
    description: 'Create new ${data.plural}.',
    operationId: 'create${data.name}s',
    tags: ['${data.plural}'],
    parameters: [
      {
        name: 'data',
        in: 'body',
        schema: {
          type: 'array',
          items: {
            $ref: '#/definitions/${data.name}'
          }
        }
      }
    ],
    responses: {
      204: {
        description: '${data.modelName}s created successfully.',
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

  DELETE: (data: any) => `async function DELETE (req, res, next) {
    const data = await mrapiFn.deleteMany(req, res, next, {
      modelName: "${data.modelName}"
    });
    res.status(204).json(data);
  };
  DELETE.apiDoc = {
    description: 'Delete ${data.plural}.',
    operationId: 'delete${data.name}s',
    tags: ['${data.plural}'],
    parameters: [
    ],
    responses: {
      204: {
        description: '${data.name}s deleted successfully.'
      },
      #{TMP_DEFAULT_RESPONSE}
    }
  };`,
}

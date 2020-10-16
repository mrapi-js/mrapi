import { findManyFilter } from '../utils/filters'

export const dependenciesPlugins = ({ getDBClient }: any) => {
  if (!getDBClient) {
    throw new Error('Initialization parameter "getDBClient" was not found.')
  }

  return {
    // get -> /api/users
    findMany: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const db = await getDBClient(req)
        const params = findManyFilter.getParams(req.query)
        const [list, total] = await Promise.all([
          db[modelName].findMany(params),
          db[modelName].count({
            where: params.where,
          }),
        ])
        return {
          code: 0,
          data: {
            list,
            total,
          },
        }
      } catch (err) {
        return {
          code: -1,
          message: err.message,
        }
      }
    },

    // post -> /api/users
    create: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const db = await getDBClient(req)
        const params = {
          data: req.body,
          // ...createFilter.getParams(req.query),
        }
        const data = await db[modelName].create(params)

        return {
          code: 0,
          data,
        }
      } catch (err) {
        return {
          code: -1,
          message: err.message,
        }
      }
    },

    // TODO: delete -> /api/users
    // deleteMany: async (
    //   req: any,
    //   _res: any,
    //   _next: any,
    //   { modelName }: { modelName: string },
    // ) => {
    //   try {
    //     const db = await getDBClient(req)
    //     const where = {}
    //     // req.body.forEach((item) => {})
    //     const data = await db[modelName].deleteMany({
    //       where,
    //     })
    //     return {
    //       code: 0,
    //       data,
    //     }
    //   } catch (err) {
    //     return {
    //       code: -1,
    //       message: err.message,
    //     }
    //   }
    // },

    // get -> /api/users/{id}
    findOne: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const db = await getDBClient(req)
        const params = {
          where: req.params,
        }
        const data = await db[modelName].findOne(params)
        return {
          code: 0,
          data,
        }
      } catch (err) {
        return {
          code: -1,
          message: err.message,
        }
      }
    },

    // put -> /api/users/{id}
    update: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const db = await getDBClient(req)
        const params = {
          where: req.params,
          data: req.body,
        }
        const data = await db[modelName].update(params)
        return {
          code: 0,
          data,
        }
      } catch (err) {
        return {
          code: -1,
          message: err.message,
        }
      }
    },

    // delete -> /api/users/{id}
    delete: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const db = await getDBClient(req)
        const params = {
          where: req.params,
        }
        const data = await db[modelName].delete(params)
        return {
          code: 0,
          data,
        }
      } catch (err) {
        return {
          code: -1,
          message: err.message,
        }
      }
    },
  }
}

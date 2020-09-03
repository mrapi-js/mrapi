import { findManyFilter } from '../utils/filters'

export const dependenciesPlugins = ({ getPrisma }: any) => {
  if (!getPrisma) {
    throw new Error('Initialization parameter "getPrisma" was not found.')
  }

  return {
    // TODO: get -> /api/users/{id}
    findOne: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const data = await prisma[modelName].findOne({
          where: req.params,
          // ...parseFilter(req.query, {
          //   selecting: true,
          // }),
        })
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

    // get -> /api/users
    findMany: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const params = findManyFilter.getParams(req.query)
        const [list, total] = await Promise.all([
          prisma[modelName].findMany(params),
          prisma[modelName].count({
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

    // TODO: post -> /api/users
    create: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const data = await prisma[modelName].create({
          data: req.body,
          // ...parseFilter(req.query, {
          //   selecting: true,
          // }),
        })

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
    deleteMany: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const data = await prisma[modelName].deleteMany({
          where: req.params,
          // ...parseFilter(req.query, {
          //   selecting: true,
          // }),
        })
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

    // TODO: delete -> /api/users/{id}
    delete: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const data = await prisma[modelName].delete({
          where: req.params,
          // ...parseFilter(req.query, {
          //   selecting: true,
          // }),
        })
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

    // TODO: put -> /api/users/{id}
    update: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const data = await prisma[modelName].update({
          where: req.params,
          data: req.body,
          // ...parseFilter(req.query, {
          //   selecting: true,
          // }),
        })
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

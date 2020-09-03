import { findManyFilter } from '../utils/filters'

export const dependenciesPlugins = ({ getPrisma }: any) => {
  if (!getPrisma) {
    throw new Error('Initialization parameter "getPrisma" was not found.')
  }

  const fn = {
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

    findMany: async (
      req: any,
      _res: any,
      _next: any,
      { modelName }: { modelName: string },
    ) => {
      try {
        const prisma = await getPrisma(req)
        const listParams = findManyFilter(req.query)
        const [list, total] = await Promise.all([
          prisma[modelName].findMany(listParams),
          prisma[modelName].count({
            where: listParams.where,
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

  return fn
}

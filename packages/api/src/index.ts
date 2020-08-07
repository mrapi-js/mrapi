export type TypeEnum = 'standalone' | 'combined'

export default class API {
  prisma: unknown
  dal: unknown

  private combinedWithDAL() {
    let DAL
    try {
      DAL = require('@mrapi/dal')
    } catch (err) {
      throw new Error(`please install '@mrapi/dal' manually`)
    }

    this.dal = new DAL()
    this.prisma = this.dal.getPrisma()
  }

  async start() {
    // demo
    this.combinedWithDAL()
    this.dal.start()
  }

  // schema stitching
  async stitching() {}
}

import { MultiTenant } from '@prisma-multi-tenant/client'

export interface PMTManageOptions {
  useManagement?: boolean
  PrismaClientManagement?: any
  tenantOptions?: any
}

const defaultOptions: PMTManageOptions = {
  useManagement: true,
}

export default class PMTManage {
  private readonly options: PMTManageOptions

  private readonly multiTenants = new Map()

  constructor(options: PMTManageOptions = {}) {
    this.options = { ...defaultOptions, ...options }
  }

  setPMT(name: string, options?: { PrismaClient: any }) {
    // delete
    if (!options?.PrismaClient) {
      if (this.multiTenants.has(name)) {
        this.multiTenants.get(name)?.disconnect()
        this.multiTenants.delete(name)
      }
      return
    }

    // add
    const { PrismaClient } = options
    const multiTenant = new MultiTenant({
      PrismaClient,
      ...this.options,
    })
    this.multiTenants.set(name, multiTenant)
  }

  getPMT(name: string) {
    if (!this.multiTenants.has(name)) {
      throw new Error(`No instance named "${name}" was found`)
    }
    return this.multiTenants.get(name)
  }

  async getPrisma(pmtName: string, dbName: string) {
    const multiTenant = this.getPMT(pmtName)
    const prisma = await multiTenant.get(dbName)
    return prisma
  }
}

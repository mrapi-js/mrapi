import { MultiTenant } from '@prisma-multi-tenant/client'

import { getUrlAndProvider } from '@mrapi/common'

interface PMTManageOptions {
  useManagement?: boolean
  PrismaClientManagement?: any
  tenantOptions?: any
  managementUrl: string
}

const defaultOptions: PMTManageOptions = {
  useManagement: true,
  managementUrl: '',
}

export default class PMTManage {
  private readonly options: PMTManageOptions

  private readonly multiTenants = new Map()

  constructor(options: PMTManageOptions) {
    this.options = { ...defaultOptions, ...options }

    const { url, provider } = getUrlAndProvider(this.options.managementUrl)
    process.env.MANAGEMENT_PROVIDER = provider
    process.env.MANAGEMENT_URL = url
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

  async getPrisma(name: string, tenantName: string, tenantUrl?: string) {
    const multiTenant = this.getPMT(name)
    if (tenantUrl) {
      const prisma = await multiTenant.directGet({
        name: tenantName,
        url: tenantUrl,
      })
      return prisma
    }
    const prisma = await multiTenant.get(tenantName)
    return prisma
  }
}

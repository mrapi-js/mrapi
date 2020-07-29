import { Tenant, MrapiError, requireDistant } from '@mrapi/common'
import { setManagementEnv } from './utils'
import { clientManagementPath } from './constants'

export default class Management {
  private readonly options?: any
  private client?: any

  constructor(options?: any) {
    this.options = options
  }

  private async getClient(): Promise<any> {
    if (this.client) return this.client

    await setManagementEnv()

    let PrismaClient

    if (this.options?.PrismaClient) {
      PrismaClient = this.options?.PrismaClient
    } else {
      try {
        PrismaClient = requireDistant(clientManagementPath).PrismaClient
      } catch {
        console.error(
          `\nError: Cannot find module '.prisma-multi-tenant/management'.\n\nTry running "prisma-multi-tenant generate"\n`,
        )
        process.exit(1)
      }
    }

    this.client = new PrismaClient({
      debug: process.env.verbose === 'true',
      ...this.options,
    })

    return this.client
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return client.tenant.create({
        data: tenant,
      })
    } catch (err) {
      if (err.code === 'P2002') {
        throw new MrapiError('tenant-already-exists', tenant.name)
      }
      throw err
    }
  }

  async read(name: string): Promise<Tenant> {
    const client = await this.getClient()

    const tenant = await client.tenant.findOne({ where: { name } })

    if (!tenant) {
      throw new MrapiError('tenant-does-not-exist', name)
    }

    return this.sanitizeTenant(tenant)
  }

  async exists(name: string): Promise<boolean> {
    const client = await this.getClient()

    const tenant = await client.tenant.findOne({ where: { name } })

    return !!tenant
  }

  async list(): Promise<Tenant[]> {
    const client = await this.getClient()

    const tenants = await client.tenant.findMany()

    return tenants.map(this.sanitizeTenant)
  }

  async update(name: string, update: Tenant): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return client.tenant.update({
        where: { name },
        data: update,
      })
    } catch (err) {
      if (err.message.includes('RecordNotFound')) {
        throw new MrapiError('tenant-does-not-exist', name)
      }
      throw err
    }
  }

  async delete(name: string): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return client.tenant.delete({ where: { name } })
    } catch (err) {
      if (err.message.includes('RecordNotFound')) {
        throw new MrapiError('tenant-does-not-exist', name)
      }
      throw err
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return await Promise.resolve()

    return this.client.disconnect()
  }

  private sanitizeTenant(tenant: Tenant): Tenant {
    return {
      name: tenant.name,
      provider: tenant.provider,
      url: tenant.url,
    }
  }
}

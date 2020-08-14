import { MultiTenant } from '@prisma-multi-tenant/client'

const multiTenant = new MultiTenant()

export default async function createContext(
  req: any,
  _res: any,
  _params: any,
  { tenantName }: { tenantName: string },
) {
  // 多租户管理
  const name = req.headers[tenantName]
  const prisma = await multiTenant.get(name)

  return { prisma }
}

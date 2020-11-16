import type { ServiceOptions as BaseServiceOptions } from '@mrapi/types'

export { TenantOptions } from '@mrapi/types'

export interface ManagementOptions {
  database: string
  clientPath: string
  tenantModelName?: string
}

export interface ServiceOptions
  extends Pick<
    BaseServiceOptions,
    'name' | 'database' | 'tenants' | 'multiTenant'
  > {
  clientPath: string
}

export enum ProviderName {
  prisma = 'prisma',
}

export interface DatasourceOptions {
  provider: ProviderName
  services: Array<ServiceOptions>
  management?: ManagementOptions
  tenantMode?: string
}

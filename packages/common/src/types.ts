export interface Datasource {
  name?: string
  provider: string
  url: string
}

export interface Tenant extends Datasource {
  id?: string
  name: string
}

export enum DBEngine {
  prisma = 'prisma',
  typeorm = 'typeorm',
}

export enum DBProvider {
  postgresql = 'postgresql',
  mysql = 'mysql',
  sqlite = 'sqlite',
}

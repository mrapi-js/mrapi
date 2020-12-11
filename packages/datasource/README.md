# @mrapi/datasource

Datasource plugin for mrapi.

## Usage

```bash
yarn add @mrapi/datasource
```

```ts
import { Datasource } from '@mrapi/datasource'

// options: DatasourceOptions
const datasource = new Datasource(options)

await datasource.init()
await datasource.getManagementClient()
await datasource.getServiceClient('service-name', 'tenant-name')
```

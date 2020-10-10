export default {
  name: 'migrate',
  description: 'Migrate "up", "down" or "save" the management or tenant',
  options: [
    ['--services <services...>', 'DAL service names and "management".'],
    ['--tenants <tenants...>', 'DAL tenant IDs for "up" action'],
    ['--action <action>', '"up", "down" or "save".'],
  ],
  async fn(args: any, opts: any, execute: Function) {
    const { services, action, tenants } = opts

    for (const name of services) {
      await execute(name, action, tenants)
    }
  },
}

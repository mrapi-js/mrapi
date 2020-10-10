export default {
  name: 'migrate',
  description: 'Migrate "up", "down" or "save" the management or tenant',
  options: [
    ['--names <names...>', 'DAL service names and "management".'],
    ['--action <action>', '"up", "down" or "save".'],
  ],
  async fn(args: any, opts: any, execute: Function) {
    const { names, action } = opts

    for (const name of names) {
      await execute(name, action)
    }
  },
}

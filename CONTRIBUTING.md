# Contribute to Mrapi

## Development

1. Setup

   ```bash
   git clone https://github.com/mrapi-js/mrapi.git
   cd mrapi
   npm i -g pnpm
   pnpm i
   ```

1. Start development

   ```bash
   pnpm run watch
   ```

## Run example

```bash
cd examples/basic # or examples/multi-tenant
pnpm i

pnpm run dev
```

## Git Commit

1. Add commit plugin

   docs: https://github.com/fbi-templates/fbi-task-commit#usage

   ```bash
   # install fbi
   npm i -g fbi@next

   # add commit plugin
   fbi add factory-commands
   ```

2. Commit

   ```bash
   fbi commit

   # if you wanna release new version, please check 'Bump the package version? Yes'
   ```

# Contribute to Mrapi

## Development

- node.js v15+
- npm v7.0.8+

1. Setup

   ```bash
   git clone https://github.com/mrapi-js/mrapi.git

   cd mrapi

   npm i --legacy-peer-deps
   ```

1. Start development

   ```bash
   npm run build
   npm run dev
   ```

## Run example

```bash
cd examples/service-basic
npm run dev
```

## Git Commit

1. Add commit plugin

   docs: https://github.com/fbi-js/factory-commands/blob/main/src/commands/commit/README.md

   ```bash
   # install fbi
   npm i -g fbi

   # add commit plugin
   fbi add factory-commands
   ```

2. Commit

   ```bash
   fbi commit

   # if you wanna release new version, please check 'Bump the package version? Yes'
   ```

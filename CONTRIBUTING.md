# Contribute to Mrapi

## Development

1. Setup

   ```bash
   git clone https://github.com/mrapi-js/mrapi.git

   cd mrapi

   yarn
   ```

1. Start development

   ```bash
   yarn dev
   ```

## Run example

```bash
cd examples/service-basic
yarn dev
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

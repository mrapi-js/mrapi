# Contribute to Mrapi

## Development Workflow

1. Fork & clone
1. Install the dependencies

   ```bash
   yarn
   ```

1. Start a watch server

   ```bash
   yarn watch
   ```

## Link packages & usage

- link

   ```bash
   cd packages/create-mrapi-app
   yarn link

   cd ../cli
   yarn link

   cd ../core
   yarn link
   ```

- create a demo app

  ```bash
  cd path/to/empty/folder
  yarn create mrapi api-demo

  cd api-demo
  yarn dev
  ```

# @mrapi/router

## Usage

```bash
yarn add @mrapi/router
```

```ts
import { Router } from '@mrapi/router'

const router = new Router()

router.on('POST', '/', () => { })
router.off('POST', '/')
router.use('/', () => { })
router.find('POST', '/')

// shorthands
router.all('/', () => { })
router.get('/', () => { })
// ...
```

# Router benchmarks

## Start

```bash
npm i
npm start
npm run rank
```

## MBP-1

- `sysctl -n machdep.cpu.brand_string`: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
- `sysctl hw.memsize`: 17179869184

### Result-1

```bash
Name                 all together
koa-tree-router      1,349,272
trek-router          875,358
trouter              702,331
find-my-way          598,206
koa-router           562,810
@mrapi/router        445,313 <-
server-router        234,681
call                 227,696
express              142,705
routr                137,525
router               133,928


Name                 all together
koa-tree-router      1,154,181
trek-router          938,015
find-my-way          698,935
trouter              687,190
@mrapi/router        677,230 <-
koa-router           516,193
server-router        255,606
call                 245,342
routr                132,609
express              129,364
router               113,164

- node: v15.0.1
- 2020-10-27 15:35
Name                 all together
koa-tree-router      1,281,028
trek-router          941,718
find-my-way          670,185
trouter              660,485
@mrapi/router        615,250 <-
koa-router           489,345
call                 253,694
server-router        245,994
express              143,672
routr                135,330
router               133,373
```

## MBP-2

- `sysctl -n machdep.cpu.brand_string`: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- `sysctl hw.memsize`: 68719476736

### Result-2

```bash
Name                 all together
koa-tree-router      1,353,852
trek-router          990,568
trouter              729,848
@mrapi/router        724,548
find-my-way          711,898
koa-router           575,725
call                 259,238
server-router        258,196
express              150,775
routr                136,271
router               131,836

Name                 all together
koa-tree-router      1,337,805
trek-router          987,974
@mrapi/router        722,178
find-my-way          670,381
trouter              666,598
koa-router           529,390
call                 246,668
server-router        237,784
routr                139,025
express              135,982
router               135,864
```


# Results

- `sysctl -n machdep.cpu.brand_string`: Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
- `sysctl hw.memsize`: 68719476736

## autocannon -c=100 -p=10 -d=10 (node: v15.0.1)

```
┌──────────────────────────────┬─────────┬────────────────────────┬─────────────────────┬───────────────────────────┐
│                              │ Version │ Requests/s (% of base) │ Latency (% of base) │ Throughput/Mb (% of base) │
├──────────────────────────────┼─────────┼────────────────────────┼─────────────────────┼───────────────────────────┤
│ service-graphql              │ 2.0.0   │ 5215.61 (100.00)       │ 18.81 (100.00)      │ 1.44 (100.00)             │
├──────────────────────────────┼─────────┼────────────────────────┼─────────────────────┼───────────────────────────┤
│ service-graphql-prisma       │ 2.0.0   │ 3426.8 (65.70)         │ 28.68 (152.47)      │ 0.72 (49.82)              │
├──────────────────────────────┼─────────┼────────────────────────┼─────────────────────┼───────────────────────────┤
│ service-graphql-prisma-mysql │ 2.0.0   │ 2370.4 (45.45)         │ 41.25 (219.30)      │ 0.50 (34.47)              │
└──────────────────────────────┴─────────┴────────────────────────┴─────────────────────┴───────────────────────────┘
```

## [with cache] autocannon -c=100 -p=10 -d=10 (node: v15.0.1)

```
┌──────────────────────────────┬─────────┬────────────────────────┬─────────────────────┬───────────────────────────┐
│                              │ Version │ Requests/s (% of base) │ Latency (% of base) │ Throughput/Mb (% of base) │
├──────────────────────────────┼─────────┼────────────────────────┼─────────────────────┼───────────────────────────┤
│ service-graphql              │ 2.0.0   │ 35153.6 (100.00)       │ 2.78 (100.00)       │ 9.32 (100.00)             │
├──────────────────────────────┼─────────┼────────────────────────┼─────────────────────┼───────────────────────────┤
│ service-graphql-prisma-mysql │ 2.0.0   │ 11494.19 (32.70)       │ 8.56 (307.91)       │ 3.48 (37.39)              │
├──────────────────────────────┼─────────┼────────────────────────┼─────────────────────┼───────────────────────────┤
│ service-graphql-prisma       │ 2.0.0   │ 11486.19 (32.67)       │ 8.56 (307.91)       │ 3.48 (37.37)              │
└──────────────────────────────┴─────────┴────────────────────────┴─────────────────────┴───────────────────────────┘
```

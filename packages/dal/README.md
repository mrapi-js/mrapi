# @mrapi/dal

generate 参考 [pal generate][https://paljs.com/generator/nexus]


# 问题汇总

## 1.无法通过 prisma-multi-tenant 自定义 prisma 目录生成多个 schema。

已提交 [ISSUES](https://github.com/Errorname/prisma-multi-tenant/issues/47)

目前已升级至 2.3.1，但是存在其他问题。
临时解决方案为：添加 `/prisma/schema.prisma` 文件用于管理 pmt 数据表

## 2.cli generate:nexus type 开发中 ing...

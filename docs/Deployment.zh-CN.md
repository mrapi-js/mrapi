# 部署方式

## `docker`部署

### 部署方式

mrapi的项目，建议采用docker部署，使用tapd工作流打包docker镜像并推送到腾讯云上，部署到对应集群里

- 1、项目内部创建Dockerfile文件，根据不同项目需要，启动不同的dockerfile指令
- 2、使用tapd建立对应的工作流，执行Dockerfile文件配置，将服务打包成docker镜像，推送到腾讯云
- 3、腾讯云上面找到容器-集群，新建对应的Workload，针对工作流推送的镜像地址来拉取镜像
- 4、点击更新pod配置来重启镜像服务

### `Dockerfile`基础配置

```js
FROM node:13

# 同步时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY . .

ENV ENVIROMENT=production

RUN yarn gen
RUN yarn build

CMD yarn start:prod
# EXPOSE 3001

# CMD ["yarn", "start"]
```

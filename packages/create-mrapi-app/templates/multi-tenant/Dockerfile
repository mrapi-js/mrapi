FROM node:13

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV production
ENV DB_URL "mysql://root:123456@127.0.0.1:3306/mrapi_db"

RUN yarn generate
RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]

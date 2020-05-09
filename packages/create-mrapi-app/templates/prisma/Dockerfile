FROM node:13

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV production
# ENV DB_HOST 0.0.0.0
# ENV DB_PORT 3306
# ENV DB_NAME mrapi_db
# ENV DB_USER root
# ENV DB_PASSWORD 123456

RUN yarn generate
RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]

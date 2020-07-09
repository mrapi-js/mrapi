FROM node:13

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install

COPY . .

ENV NODE_ENV production
ENV DB_URL "mysql://root:123456@127.0.0.1:3306/mrapi_db"

RUN npm run gen && npm run build && npm run db:save && npm run db:up

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

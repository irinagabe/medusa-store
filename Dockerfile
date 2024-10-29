FROM node:20.12.2-alpine3.18 as build

WORKDIR /app/server

COPY . .

RUN yarn install --frozen-lockfile

ENTRYPOINT ["sh", "-c", "npm run predeploy && npm run start"]
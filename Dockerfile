FROM node:16

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
COPY tsconfig.json /app
COPY src /app/src

RUN yarn
RUN yarn build

RUN useradd -u 8877 api
USER api

CMD ["node", "."]
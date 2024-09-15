FROM node:20-alpine

RUN npm i -g @nestjs/cli typescript ts-node

COPY package*.json /tmp/app/

RUN cd /tmp/app && npm install --frozen-lockfile --production
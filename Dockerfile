FROM node:18-alpine

WORKDIR /app

COPY ./dist ./dist
COPY package*.json . 

RUN npm install --production

EXPOSE 8080

CMD ["npm", "run", "start:prod"]

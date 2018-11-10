FROM node:8-alpine

WORKDIR /maze

COPY package.json ./
RUN npm run install

COPY * ./
RUN npm run build

EXPOSE 80
CMD node index.js

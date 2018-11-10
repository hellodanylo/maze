FROM node:8-alpine

WORKDIR /maze

COPY package.json ./
RUN npm install

COPY css css/
COPY html html/
COPY img img/
COPY js js/
COPY sounds sounds/
COPY gulpfile.js index.js package.json ./

RUN npm run build

EXPOSE 80
CMD node index.js

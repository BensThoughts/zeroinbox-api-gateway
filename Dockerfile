# Stage 1
FROM node:11.10.0-stretch as node-build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install && mkdir logs
COPY ./src ./src
CMD node /usr/src/app/src/index.js

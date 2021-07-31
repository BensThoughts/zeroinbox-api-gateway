# Stage 1
FROM node:latest as node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=prod && mkdir logs
COPY ./src ./src
CMD node /usr/src/app/src/index.js

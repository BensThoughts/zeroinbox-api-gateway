# Stage 1
FROM node:16-alpine as node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=prod && mkdir logs
COPY ./src ./src
CMD node /usr/src/app/src/index.js

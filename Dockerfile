# Stage 1
FROM node:16 as node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production && mkdir logs
COPY ./src ./src
USER node
CMD node /usr/src/app/src/index.js
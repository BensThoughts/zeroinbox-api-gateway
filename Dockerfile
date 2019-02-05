# Stage 1
FROM node:8.11.2-alpine as node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install && mkdir logs
COPY ./src ./src
LABEL "org.label-schema.vendor"="Zero Inbox"
LABEL "org.label-schema.version"="1.0.0 - alpha"
# Gateway API runs on 3000
EXPOSE 3000

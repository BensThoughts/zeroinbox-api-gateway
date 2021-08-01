# Stage 1
FROM node:16 as node
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production && mkdir logs
COPY ./src ./src
# USER node
# CMD ["/usr/src/app/src/index.js", "-and", "-its", "arguments"]
CMD ["node", "/usr/src/app/src/index.js"]
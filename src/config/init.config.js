const fs = require('fs');
const path = require('path');
const workdir = path.resolve(__dirname) + '/'
const logger = require(workdir + '../loggers/log4js');
let Config = fs.readFileSync(workdir + './config.json');
Config = JSON.parse(Config.toString());

const dotenv = require('dotenv');
const result = dotenv.config();
console.log(result);

module.exports = {
    RABBIT_TOPOLOGY: Config,
    EXPRESS_PORT: process.env.EXPRESS_PORT,
    EXPRESS_HOST: process.env.EXPRESS_HOST,
    CORS_WHITELIST: process.env.CORS_WHITELIST,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    MONGO_URL: process.env.MONGO_URL,
}
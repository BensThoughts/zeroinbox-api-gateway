'use strict';

/*******************************************************************************
* Config Init
*******************************************************************************/

const logger = require('./libs/loggers/log4js');
const configLogger = require('./libs/loggers/config.logger');

configLogger.logConfig();

const {
  EXPRESS_HOST,
  EXPRESS_PORT,
  CORS_WHITELIST,
  SESSION_REDIS_HOST,
  SESSION_REDIS_PORT,
  SESSION_SECRET,
  MONGO_URI,
 } = require('./config/init.config');

const { rabbit_config } = require('./config/rabbit.config');

/*******************************************************************************
* EXPRESS INIT
*******************************************************************************/
const express = require('express');
const googleApi = express();

googleApi.get('/', (req, res) => {
  // logger.debug('GKE Ingress health checked!');
  res.status(200).send();
});

// Naive health check
const healthRouter = require('./core/health/health.routes')
googleApi.use('/', healthRouter);

/*******************************************************************************
* EXPRESS CORS SETUP
*******************************************************************************/
const cors = require('cors');

let whitelist;

if (CORS_WHITELIST.indexOf(',') !== -1) {
  whitelist = CORS_WHITELIST.split(',');
} else {
  whitelist = CORS_WHITELIST
}

googleApi.use(
  cors({
    origin: whitelist,
    credentials: true
  }),
);

/*******************************************************************************
* JSON and BODY PARSER (urlencoded) SETUP
*******************************************************************************/
googleApi.use(express.json({ limit: '5mb' }));
googleApi.use(express.urlencoded({ extended: false, limit: '5mb' }));

/*******************************************************************************
* EXPRESS WITH SESSIONS (uses cookies) AND REDIS SETUP
*******************************************************************************/
const redis = require('redis');
const session = require('express-session');
let RedisStore = require('connect-redis')(session);
const REDIS_URL = 'redis://' + SESSION_REDIS_HOST + ':' + SESSION_REDIS_PORT;
let redisClient = redis.createClient(REDIS_URL);
const genuuid = require('uid-safe');



googleApi.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    resave: false,
    genid: function(req) {
      return genuuid.sync(18); // use UUIDs for session IDs
    },
    secret: SESSION_SECRET,
    cookie: {
      expires: new Date(2147483647000)
      // maxAge: 60 * 60 * 1000
    },
    saveUninitialized: false
  })
);

/*******************************************************************************
* LOGGING INIT (MORGAN) Http request logging
*******************************************************************************/
const addRequestId = require('express-request-id')();
const morgan = require('morgan');
const morganChalk = require('./libs/loggers/morgan.chalk');

googleApi.use(addRequestId);

morgan.token('id', function getId(req) {
  return req.id
});

googleApi.use(morgan(morganChalk.logOK, {
  skip: function (req, res) {
          return res.statusCode >= 400
        },
  stream: process.stdout
}));
googleApi.use(morgan(morganChalk.logError, {
  skip: function (req, res) {
          return res.statusCode < 400
        },
  stream: process.stderr
}));

/*******************************************************************************
* EXPRESS MIDDLEWARE TO HANDLE IF REQUEST IS AUTHORIZED WITH A TOKEN
*******************************************************************************/
const sessionErrors = require('./libs/error-handlers/session-errors');
const authErrors = require('./libs/error-handlers/auth-errors');
const userIdErrors = require('./libs/error-handlers/user-id-errors');
const emailIdErrors = require('./libs/error-handlers/email-id-errors');

const refreshToken = require('./libs/middleware/refresh-token');

const actionPostErrors = require('./libs/error-handlers/action-post-errors');


googleApi.use(sessionErrors);
googleApi.use(authErrors);
googleApi.use(userIdErrors);
googleApi.use(emailIdErrors);
googleApi.use(refreshToken);
googleApi.use(actionPostErrors);


/**oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO
  ____                       _             _            _
 / ___|  ___    ___    __ _ | |  ___      / \    _ __  (_)
| |  _  / _ \  / _ \  / _` || | / _ \    / _ \  | '_ \ | |
| |_| || (_) || (_) || (_| || ||  __/   / ___ \ | |_) || |
 \____| \___/  \___/  \__, ||_| \___|  /_/   \_\| .__/ |_|
                      |___/                     |_|
oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO**/

const authRouter = require('./core/auth/auth.routes');
const userRouter = require('./core/user/user.routes');
const loadingRouter = require('./core/loading/loading.routes');
// const statsRouter = require('./core/stats/stats.routes');
const actionsRouter = require('./core/actions/actions.routes');
const sendersRouter = require('./core/senders/senders.routes');
const settingsRouter = require('./core/settings/settings.routes');

googleApi.use('/v1', authRouter);
googleApi.use('/v1', userRouter);
googleApi.use('/v1', loadingRouter);
// googleApi.use('/v1', statsRouter);
googleApi.use('/v1', actionsRouter);
googleApi.use('/v1', sendersRouter);
googleApi.use('/v1', settingsRouter);

/*******************************************************************************
Connections INIT
*******************************************************************************/
const mongoose = require('mongoose');
const rabbit = require('zero-rabbit');



mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {;
  if (err) {
    logger.error('Error in index.js at mongoose.connect(): ' + err);
  } else {
    logger.info('Connected to MongoDB!');
    rabbit.connect(rabbit_config, (err, conn) => {
      if (err) {
        logger.error('Error in rabbit.connect: ' + err);
      }
      logger.info('Connected to RabbitMQ!')

    });
  }
});

/*******************************************************************************
Signal handling for graceful shutdown
*******************************************************************************/
const signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGQUIT': 3,
  'SIGABRT': 6,
  // 'SIGKILL': 9, // doesn't work
  'SIGTERM': 15,
};

let server = googleApi.listen(EXPRESS_PORT, EXPRESS_HOST);
processHandler(server);
logger.info(`Running on http://${EXPRESS_HOST}:${EXPRESS_PORT}`);

function processHandler(server) {
  Object.keys(signals).forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Process received a ${signal} signal`);
      shutdown(server, signal, signals[signal]);
    });
  });
}

const shutdown = (server, signal, value) => {
  logger.info(`Server stopped by ${signal} with value ${value}`);
  server.close(() => {
    logger.info('expressjs server closed')
    rabbit.disconnect(() => {
      logger.info('disconnected from zero-rabbit (RabbitMQ)');
      mongoose.disconnect().then(() => {
        logger.info('disconnected from mongoose (MongoDB)')
      });
    });
  });
}

module.exports = googleApi;
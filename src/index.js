'use strict';

/**
* Config Init
*****************************************************************************/

const logger = require('./libs/loggers/log4js');
const configLogger = require('./libs/loggers/config.logger');

configLogger.logConfig();

const {
  // EXPRESS_HOST,
  EXPRESS_PORT,
  CORS_WHITELIST,
  // SESSION_REDIS_HOST,
  // SESSION_REDIS_PORT,
  // SESSION_REDIS_URL,
  SESSION_SECRET,
  MONGO_URI,
} = require('./config/init.config');

const {rabbitConfig} = require('./config/rabbit.config');

/**
* EXPRESS INIT
*****************************************************************************/
const express = require('express');
const googleApi = express();

googleApi.get('/', (req, res) => {
  // logger.debug('GKE Ingress health checked!');
  res.status(200).send();
});

// Naive health check
const healthRouter = require('./core/health/health.routes');
googleApi.use('/', healthRouter);

/**
* EXPRESS CORS SETUP
*****************************************************************************/
const cors = require('cors');

let whitelist;

if (CORS_WHITELIST.indexOf(',') !== -1) {
  whitelist = CORS_WHITELIST.split(',');
} else {
  whitelist = CORS_WHITELIST;
}

googleApi.use(
    cors({
      origin: whitelist,
      credentials: true,
    }),
);

/**
* JSON and BODY PARSER (urlencoded) SETUP
*****************************************************************************/
googleApi.use(express.json({limit: '5mb'}));
googleApi.use(express.urlencoded({extended: false, limit: '5mb'}));

/**
* EXPRESS WITH SESSIONS (uses cookies) AND REDIS SETUP
*****************************************************************************/
// const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
// const redis = require('redis');


// let REDIS_URL = 'redis://' + SESSION_REDIS_HOST + ':' + SESSION_REDIS_PORT;
// if (SESSION_REDIS_URL) {
//   REDIS_URL = SESSION_REDIS_URL;
// }

// const genuuid = require('uid-safe');


// const redisClient = redis.createClient(REDIS_URL);
// googleApi.use(
//     session({
//     // store: new RedisStore({
//     //   client: redisClient,
//     // }),
//       resave: false,
//       genid: function(req) {
//         return genuuid.sync(18); // use UUIDs for session IDs
//       },
//       secret: SESSION_SECRET,
//       cookie: {
//         expires: new Date(2147483647000),
//         // maxAge: 60 * 60 * 1000
//       },
//       saveUninitialized: false,
//     }),
// );
const cookieSession = require('cookie-session');

googleApi.use(cookieSession({
  name: '__session',
  keys: [SESSION_SECRET],
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));

/**
* LOGGING INIT (MORGAN) Http request logging
*****************************************************************************/
const addRequestId = require('express-request-id')();
const morgan = require('morgan');
const morganChalk = require('./libs/loggers/morgan.chalk');

googleApi.use(addRequestId);

morgan.token('id', function getId(req) {
  return req.id;
});

googleApi.use(morgan(morganChalk.logOK, {
  skip: function(req, res) {
    return res.statusCode >= 400;
  },
  stream: process.stdout,
}));

googleApi.use(morgan(morganChalk.logError, {
  skip: function(req, res) {
    return res.statusCode < 400;
  },
  stream: process.stderr,
}));

/**
* EXPRESS MIDDLEWARE TO HANDLE IF REQUEST IS AUTHORIZED WITH A TOKEN
*****************************************************************************/
const userIdLogger = require('./libs/loggers/userid.logger');

const sessionErrors = require('./libs/error-handlers/session-errors');
const authErrors = require('./libs/error-handlers/auth-errors');
const userIdErrors = require('./libs/error-handlers/user-id-errors');
const emailIdErrors = require('./libs/error-handlers/email-id-errors');

const refreshToken = require('./libs/middleware/refresh-token');

const actionPostErrors = require('./libs/error-handlers/action-post-errors');

googleApi.use(userIdLogger);
googleApi.use(sessionErrors);
googleApi.use(authErrors);
googleApi.use(userIdErrors);
googleApi.use(emailIdErrors);
googleApi.use(refreshToken);
googleApi.use(actionPostErrors);


/**
 * oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0Oo
  ____                       _             _            _
 / ___|  ___    ___    __ _ | |  ___      / \    _ __  (_)
| |  _  / _ \  / _ \  / _` || | / _ \    / _ \  | '_ \ | |
| |_| || (_) || (_) || (_| || ||  __/   / ___ \ | |_) || |
 \____| \___/  \___/  \__, ||_| \___|  /_/   \_\| .__/ |_|
                      |___/                     |_|
oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0Oo**/

const authRouter = require('./core/auth/auth.routes');
const userRouter = require('./core/user/user.routes');
const loadingRouter = require('./core/loading/loading.routes');
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

/**
Connections INIT
*****************************************************************************/
const mongoose = require('mongoose');
const rabbit = require('zero-rabbit');

mongoose.connect(MONGO_URI,
    {useNewUrlParser: true, useUnifiedTopology: true},
    (err, db) => {
      if (err) {
        throw new Error('Error in index.js at mongoose.connect(): ' + err);
      } else {
        logger.info('Connected to MongoDB!');
        rabbit.connect(rabbitConfig, (err, conn) => {
          if (err) {
            throw new Error('Error in index.js at rabbit.connect(): ' + err);
          }
          logger.info('Connected to RabbitMQ!');

          // If getting EADDR Already in use, probably rabbit.connect has
          // tried to reconnect/reload
          // const server = googleApi.listen(EXPRESS_PORT, EXPRESS_HOST);
          const server = googleApi.listen(EXPRESS_PORT, () => {
            logger.info('Express server started');
          });
          logger.info(JSON.stringify(server.address()));
          processHandler(server);
        });
      }
    },
);

/**
Signal handling for graceful shutdown
*****************************************************************************/

/**
 * @param  {ExpressJS} server
 */
function processHandler(server) {
  const signals = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGQUIT': 3,
    'SIGABRT': 6,
    // 'SIGKILL': 9, // doesn't work
    'SIGTERM': 15,
  };

  Object.keys(signals).forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Process received a ${signal} signal`);
      shutdown(server, signal, signals[signal]);
    });
  });
}

const shutdown = (server, signal, value) => {
  logger.info(`Api-Gateway service stopped by ${signal} with value ${value}`);
  server.close((serverErr) => {
    if (serverErr) {
      logger.error('ExpressJS server close error: ' + serverErr);
      process.exitCode = 1;
    }
    logger.info('ExpressJS server closed');
    rabbit.disconnect((rabbitErr) => {
      if (rabbitErr) {
        logger.error('RabbitMQ disconnect error: ' + rabbitErr);
        process.exitCode = 1;
      }
      logger.info('disconnected from RabbitMQ!');
      mongoose.disconnect((mongooseErr) => {
        if (mongooseErr) {
          logger.error('MongoDB disconnect error: ' + mongooseErr);
          process.exitCode = 1;
        }
        logger.info('disconnected from MongoDB!');
        process.exit(); // TODO: someway to exit process without?
      });
    });
  });
};

module.exports = googleApi;

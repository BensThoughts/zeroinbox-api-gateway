'use strict';

/*******************************************************************************
* Config Init
*******************************************************************************/
const {
  express_port,
  express_host,
  cors_whitelist,
  session_redis_host,
  session_redis_port,
  session_secret,
  mongo_uri,
 } = require('./config/init.config');

const { rabbit_config } = require('./config/rabbit.config');

const logger = require('./libs/loggers/log4js');

/*******************************************************************************
* EXPRESS INIT
*******************************************************************************/
const express = require('express');
const googleApi = express();

googleApi.get('/', (req, res) => {
  logger.debug('GKE Ingress health checked!');
  res.status(200).send();
});

// Naive health check
const healthRouter = require('./core/health/health.routes')
googleApi.use('/', healthRouter);

/*******************************************************************************
* EXPRESS CORS SETUP
*******************************************************************************/
const cors = require('cors');

const whitelist = cors_whitelist;
logger.debug('Cors Whitelist: ' + whitelist);

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
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const genuuid = require('uid-safe');

googleApi.use(
  session({
    store: new RedisStore({
     host: session_redis_host,
     port: session_redis_port,
    }),
    resave: false,
    genid: function(req) {
      return genuuid.sync(18); // use UUIDs for session IDs
    },
    secret: session_secret,
    cookie: {
      maxAge: 60 * 60 * 1000
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
const routeErrors = require('./libs/error-handler/route-errors');
googleApi.use(routeErrors);

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
const suggestionsRouter = require('./core/suggestions/suggestions.routes');
const loadingRouter = require('./core/loading/loading.routes');
// const statsRouter = require('./core/stats/stats.routes');
const actionsRouter = require('./core/actions/actions.routes');


googleApi.use('/v1', authRouter);
googleApi.use('/v1', userRouter);
googleApi.use('/v1', suggestionsRouter);
googleApi.use('/v1', loadingRouter);
// googleApi.use('/v1', statsRouter);
googleApi.use('/v1', actionsRouter);

/*******************************************************************************
Connections INIT
*******************************************************************************/
const mongoose = require('mongoose');
const rabbit = require('zero-rabbit');

mongoose.connect(mongo_uri, {useNewUrlParser: true}, (err, db) => {;
  if (err) {
    logger.error('Error in index.js at mongoose.connect(): ' + err);
  } else {
    logger.info('Connected to MongoDB!');
    rabbit.connect(rabbit_config, (err, conn) => {
      logger.info('Connected to RabbitMQ!')
      let server = googleApi.listen(express_port, express_host);
      processHandler(server);
      logger.info(`Running on http://${express_host}:${express_port}`);
    });
  }
});

/*******************************************************************************
Signal handling for graceful shutdown
*******************************************************************************/
const signals = {
  'SIGTERM': 15
};

function processHandler(server) {
  Object.keys(signals).forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Process received a ${signal} signal`);
      shutdown(server, signal, signals[signal]);
    });
  });
}

const shutdown = (server, signal, value) => {
  logger.info('shutdown!');
  server.close(() => {
    logger.info(`Server stopped by ${signal} with value ${value}`);
    rabbit.disconnect(() => {
      logger.info('rabbit disconnected');
      mongoose.disconnect();
    });
  });
}

module.exports = googleApi;
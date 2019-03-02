'use strict';

/*******************************************************************************
* LOGGING INIT (LOG4JS) App (console/file) logging
*******************************************************************************/
const logger = require('./loggers/log4js');


/*******************************************************************************
* EXPRESS INIT
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
const morganChalk = require('./loggers/morgan.chalk');

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
googleApi.use((req, res, next) => {
  if (!req.session) {
    logger.debug('No session set, is redis up? or attacker?!');
    res.status(403).json({
      status: 'error',
      status_message: 'No session found, was cookie set correctly?!'
    });
  } else {
    let path = req.path;
    switch(path) {
      case '/v1/oauth2init':
        return next();
      case '/v1/oauth2callback':
        return next();
      case '/v1/basicProfile':
        return checkAuth(req, res, next);
      case '/v1/emailProfile':
        if (!req.session.user_info.userId) {
          return res.status(500).json({
            status: 'error',
            status_message: 'Must call /v1/basicProfile before calling /v1/emailProfile'
          });
        } else {
          return checkAuth(req, res, next);
        }
      default:
        return next();
    }
  }
});

function checkAuth(req, res, next) {
  if (!req.session.token) {
    return res.status(401).json({
      status: 'error',
      status_message: 'No credentials set!'
    });
  }
  return next();
}

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
const labelsRouter = require('./core/labels/labels.routes');
const suggestionsRouter = require('./core/suggestions/suggestions.routes');
const loadingRouter = require('./core/loading/loading.routes');


googleApi.use('/v1', authRouter);

googleApi.use('/v1', userRouter);

googleApi.use('/v1', labelsRouter);

googleApi.use('/v1', suggestionsRouter);

googleApi.use('/v1', loadingRouter);


/*******************************************************************************
 MONGOOSE INIT
*******************************************************************************/
const mongoose = require('mongoose');
// const rabbit = require('./helpers/rabbit.helper');
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

// SIG Handling
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

// App shutdown logic
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
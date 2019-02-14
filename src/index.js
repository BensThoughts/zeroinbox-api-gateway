'use strict';

/*******************************************************************************
* LOGGING INIT (LOG4JS) App (console/file) logging
*******************************************************************************/
const logger = require('./loggers/log4js');


/*******************************************************************************
* EXPRESS INIT
*******************************************************************************/
const {
  RABBIT_TOPOLOGY,
  EXPRESS_PORT,
  EXPRESS_HOST,
  CORS_WHITELIST,
  REDIS_HOST,
  REDIS_PORT,
  MONGO_URL
 } = require('./config/init.config');

const express = require('express');
const googleApi = express();



/*******************************************************************************
* EXPRESS CORS SETUP
*******************************************************************************/
const cors = require('cors');

const whiteList = CORS_WHITELIST.split(',');
logger.trace(whiteList);

googleApi.use(
  cors({
    origin: true,
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
// const redis = require('redis');
//const redis_client = redis.createClient(process.env.REDIS_URL);


googleApi.use(
  session({
    store: new RedisStore({
     host: REDIS_HOST,
     port: REDIS_PORT,
    }),
    resave: false,
    genid: function(req) {
      return genuuid.sync(18); // use UUIDs for session IDs
    },
    secret: '81de324d-c5bc-42f5-9681-b1a4bd603b53',
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
  let path = req.path;
  if (path !== '/oauth2init') {
    if (path !== '/oauth2callback') {
      if (!req.session.token) {
        return res.status(403).json({ error: 'No credentials sent!' });
      }
    }
  }
  next();
});


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


googleApi.use('/', authRouter);

googleApi.use('/', userRouter);

googleApi.use('/', labelsRouter);

googleApi.use('/', suggestionsRouter);

googleApi.use('/', loadingRouter);


/*******************************************************************************
 MONGOOSE INIT
*******************************************************************************/
const mongoose = require('mongoose');
// const rabbit = require('./helpers/rabbit.helper');
const rabbit = require('zero-rabbit');


mongoose.connect(MONGO_URL, {useNewUrlParser: true}, (err, db) => {;
  if (err) {
    logger.error('Error in index.js at mongoose.connect(): ' + err);
  } else {
    logger.info('Mongo Connected: ' + MONGO_URL);
    rabbit.connect(RABBIT_TOPOLOGY.rabbit, (err, ch) => {
      googleApi.locals.db = db;
      googleApi.listen(EXPRESS_PORT, EXPRESS_HOST);
      logger.info(`Running on http://${EXPRESS_HOST}:${EXPRESS_PORT}`);
    });
  }
});

module.exports = googleApi;
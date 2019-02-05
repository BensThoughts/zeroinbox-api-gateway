'use strict';


/*******************************************************************************
* EXPRESS INIT
*******************************************************************************/
const Config = require('./config/config');
const conf = new Config();
console.log(conf);

const express = require('express');
const googleApi = express();

const PORT = conf.port;
const HOST = '0.0.0.0';
// const HOST = '127.0.0.1';

/*******************************************************************************
* EXPRESS WITH CORS AND BODY-PARSER SETUP
*******************************************************************************/
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const genuuid = require('uid-safe');
const redis = require('redis');
const redis_client = redis.createClient(process.env.REDIS_URL);

/*******************************************************************************
* LOGGING INIT (MORGAN)
*******************************************************************************/
const addRequestId = require('express-request-id')();
const morgan = require('morgan');
const morganChalk = require('./config/morgan.chalk');
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
* LOGGING INIT (LOG4JS)
*******************************************************************************/
const logger = require('./logger/logger');
logger.info('Logger started');

/* var logger = require('winston-logstash-transport').createLogger(null, {
  application: 'zero-inbox',
  logstash: { host: logstash, port: 5000 },
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'api-gateway-service' },
  transports: [
    new winston.transports.File({ filename: '../logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../logs/combined.log' }),
    // new winston.transports.Logstash({ port: 5000, host: 'logstash', node_name: 'test'})
  ]
}); */


const whiteList = [
  'http://127.0.0.1:80',
  'http://127.0.0.1:4200'
  // 'http://192.168.1.115:80',
  // 'http://192.168.1.115'
  // 'https://us-central1-labelorganizer.cloudfunctions.net',
];



googleApi.use(
  cors({
    origin: true,
    credentials: true
  }),
  // cookieParser(),
  // bodyParser({ limit: '5mb' })

);

googleApi.use(express.json({ limit: '5mb' }));
googleApi.use(express.urlencoded({ extended: false, limit: '5mb' }));

/*******************************************************************************
* EXPRESS WITH SESSIONS (uses cookies) AND REDIS SETUP
*******************************************************************************/



googleApi.use(
  session({
    store: new RedisStore({
     host: '127.0.0.1',
     port: 6379,
     client: redis_client
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
const threadsRouter = require('./core/threads/threads.routes');
const suggestionsRouter = require('./core/suggestions/suggestions.routes');
const loadingRouter = require('./core/loading/loading.routes');


googleApi.use('/', authRouter);

/**oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO
START...ALL REQUEST BASED API CALLS
oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO**/

googleApi.use('/', userRouter);

googleApi.use('/', labelsRouter);

googleApi.use('/', threadsRouter);

/**oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO
END...ALL REQUEST BASED API CALLS
oO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO0OooO**/

googleApi.use('/', suggestionsRouter);

googleApi.use('/', loadingRouter);

/*******************************************************************************
 MONGOOSE INIT
*******************************************************************************/

const mongoose = require('mongoose');

mongoose.connect(conf.db, {useNewUrlParser: true}, (err, db) => {;
  if (err) {
    console.error(err)
  } else {
    googleApi.locals.db = db;
    googleApi.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);
  }
});

module.exports = googleApi
/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const logger = require('../../loggers/log4js');
const rabbit = require('zero-rabbit');

/*******************************************************************************
 INIT MONGOOSE
*******************************************************************************/
const History = require('../models/history.model');

/*******************************************************************************
 Check Loading Status
*******************************************************************************/

/**
 * The client can poll /loadingStatus to find out if the inbox is still loading.
 * After this comes back false the client can safely hit /suggestions endpoint
 * to gather all of the suggestions
 */
exports.loading_status = function (req, res) {

  let userId = req.session.user_info.userId;

  let conditions = { userId: userId }

  History.findOne(conditions, (err, raw) => {
    if (err) {
      logger.error('Error at loading_status in history.findOne(): ' + err);
      res.status(500).json({
        status: 'error',
        status_message: 'internal server error at path /loadingStatus'
      });
    }
    let loadingStatus = raw.active.loadingStatus;
    let percentLoaded = raw.active.percentLoaded;
    res.json({ 
      status: 'success',
      status_message: 'OK',
      data: {
        loadingStatus: loadingStatus,
        percentLoaded: percentLoaded,
      }
    });
  });

};

exports.first_run_status = function(req, res) {
  let userId = req.session.user_info.userId;

  let conditions = { userId: userId }

  History.findOne(conditions, (err, doc) => {
    if (err) {
      logger.error('Error at first_run_status in history.findOne(): ' + err)
      res.json({
        status: 'error',
        status_message: 'internal server error at path /firstRunStatus'
      });
    }

    if (doc.passive === undefined) {
      res.json({
        status: 'success',
        status_message: 'OK',
        data: {
          firstRun: true
        }
      });
    } else {
      res.json({
        status: 'success',
        status_message: 'OK',
        data: {
          firstRun: doc.passive.findRun
        }
      });
    }
  });
}


exports.load_suggestions = function(req, res, next) {
  let userId = req.session.user_info.userId;
  let access_token = req.session.token.access_token;

  let conditions = { userId: userId }

  History.findOne(conditions, (err, doc) => {
    if (err) {
      logger.error('Error at load_suggestions in history.findOne(): ' + err);
      res.json({
        status: 'error',
        status_message: 'internal server error at path /loadSuggestions',
      });
    }
    
    // check to make sure active exists it won't exist on the users first run ever
    // if loadingStatus is false we can safely send off the command message to start loading
    // the inbox.  Else the inbox is already/still loading from a previous (recent) sign in.
    if (doc.active === undefined) {
      publishUser(userId, access_token);
      updateLoadingStatus(userId, () => {
        res.json({
          status: 'success',
          status_message: 'OK'
        }); 
      });
    } else if (!doc.active.loadingStatus) {
      publishUser(userId, access_token);
      updateLoadingStatus(userId, () => {
        res.json({
          status: 'success',
          status_message: 'OK',
        }); 
      });
    } else {
      res.json({
        status: 'success',
        status_message: 'Already Loading',
      });
    }  
  });
}

function publishUser(userId, access_token) {
  let sentAt = new Date().getTime();
  logger.debug(sentAt);
  rabbit.publish('api.send.1', 'user.ids.ex.1', '', {
    userId: userId,
    access_token: access_token,
  }, { 
    contentType: 'application/json', 
    type: 'user',
    appId: 'zi-api-gateway',
    timestamp: sentAt,
    encoding: 'string Buffer',

    persistent: true,
  });
}

function updateLoadingStatus(userId, cb) {
  let conditions = { userId: userId };

  let update = {
    'active.loadingStatus': true,
    'active.percentLoaded': 5
  }

  let options = {
    multi: false,
    upsert: true
  }
  History.updateOne(conditions, update, options, (err, doc) => {

    // update active.loadingStatus then tell client to start polling loadingStatus
    // by indicating firstRun
    cb();

  });

}

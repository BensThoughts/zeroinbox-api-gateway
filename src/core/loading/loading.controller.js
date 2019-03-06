/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');
const rabbit = require('zero-rabbit');

/*******************************************************************************
 INIT MONGOOSE
*******************************************************************************/
const History = require('../models/history.model');

const {
  DEFAULT_PERCENT_LOADED
} = require('../../config/init.config');

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
        status_message: 'internal server error at path /loadingStatus: Error getting loadingStatus'
      });
    } else {
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
    }
  });
};

exports.first_run_status = function(req, res) {
  let userId = req.session.user_info.userId;

  let conditions = { userId: userId }

  History.findOne(conditions, (err, doc) => {
    if (err) {
      logger.error('Error at first_run_status in history.findOne(): ' + err);
      res.status(500).json({
        status: 'error',
        status_message: 'internal server error at path /firstRunStatus'
      });
    } else {
      let firstRunEver = checkFirstRunEver(doc);
      updatePassiveHistory(userId, firstRunEver);
      if (firstRunEver) {
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: firstRunEver
          }
        });
      } else {
        let firstRun = checkFirstRun(doc);
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: firstRun
          }
        });
      }
    }
  });
}

function checkFirstRunEver(doc) {
  if (doc === null || !doc) {
    return true;
  }
  if (doc.passive === undefined) {
    return true;
  }
  if (doc.passive.firstRun === undefined) {
    return true;
  }
  return false;
}

function checkFirstRun(doc) {
  return doc.passive.firstRun;
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
        status_message: 'Internal server error at path /loadSuggestions: DB Error, cannot load suggestions',
      });
    } else {
      let alreadyLoading = checkLoadingStatus(doc);
      if (alreadyLoading) {
        res.status(200).json({
          status: 'success',
          status_message: 'Already Loading',
        });
      } else {
        publishUser(userId, access_token);
        updateLoadingHistory(userId, (err, doc) => {
          if (err) {
            logger.error('Error at load_suggestions in updateLoadingStatus(): ' + err);
            res.status(500).json({
              status: 'error',
              status_message: 'Internal server error at /loadSuggestions: error setting loadingStatus'
            });
          } else {
            res.json({
              status: 'success',
              status_message: 'OK'
            });
          } 
        });
      }
    }
  });
}

function checkLoadingStatus(doc) {
  if (doc === null || !doc) {
    return false;
  }
  if (doc.active === undefined) {
    return false;
  }
  if (doc.active.loadingStatus === undefined) {
    return false;
  }
  return doc.active.loadingStatus;
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

function updateLoadingHistory(userId, callback) {
  let conditions = { userId: userId };

  let update = {
    'active.loadingStatus': true,
    'active.percentLoaded': DEFAULT_PERCENT_LOADED
  }

  let options = {
    multi: false,
    upsert: true
  }
  History.updateOne(conditions, update, options, (err, doc) => {

    // update active.loadingStatus then tell client to start polling loadingStatus
    // by indicating firstRun
    callback(err, doc);

  });

}

function updatePassiveHistory(userId, firstRunEver) {
  let passiveUpdate;

  if (firstRunEver) {
    passiveUpdate = {
      "userId": userId,
      "passive.firstRun": true,
      "passive.firstRunDate": new Date(),
      "passive.lastRunDate": new Date()
    }
  } else {
    passiveUpdate = {
      "userId": userId,
      "passive.lastRunDate": new Date()
    }
  }

  let conditions = { userId: userId };

  let options = {
    multi: false,
    upsert: true
  }
  History.updateOne(conditions, passiveUpdate, options, (err, doc) => {

  });
}

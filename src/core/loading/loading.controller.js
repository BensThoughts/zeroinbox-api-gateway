/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');
const rabbit = require('zero-rabbit');

/*******************************************************************************
 INIT MONGOOSE
*******************************************************************************/
// const History = require('../models/history.model');

const mongooseUtils = require('../../libs/utils/mongoose.utils');
const upsertToHistory = mongooseUtils.upsertToHistory;
const findOneHistory = mongooseUtils.findOneHistory;

const rabbitUtils = require('../../libs/utils/rabbit.utils');
const publishUser = rabbitUtils.publishUser;

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

  findOneHistory(userId, (err, loadingDoc) => {
    if (err) {
      logger.error('MongoDB Error at loading_status in history.findOne(): ' + err);
      res.status(500).json({
        status: 'error',
        status_message: 'internal server error at path /loadingStatus: Error getting loadingStatus'
      });
    } else {
      let ok = checkLoadingDoc(loadingDoc);
      if (ok) {
        res.status(200).json({ 
          status: 'success',
          status_message: 'OK',
          data: {
            loadingStatus: loadingDoc.active.loadingStatus,
            percentLoaded: loadingDoc.active.percentLoaded,
          }
        });
      } else {
        res.status(400).json({
          status: 'error',
          status_message: 'Error checking /loadingStatus: Did you call /loadSuggestions first?'
        });
      }
    }
  });
};

function checkLoadingDoc(loadingDoc) {
  if (loadingDoc === null || !loadingDoc) {
    return false;
  }
  if (loadingDoc.active === undefined) {
    return false;
  }
  if (loadingDoc.active.loadingStatus === undefined) {
    return false;
  }
  if (loadingDoc.active.percentLoaded === undefined) {
    return false;
  }
  return true;
}

exports.first_run_status = function(req, res) {
  let userId = req.session.user_info.userId;

  findOneHistory(userId, (err, doc) => {
    if (err) {
      logger.error('MongoDB Error at first_run_status in history.findOne(): ' + err);
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
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: doc.passive.firstRun
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

exports.load_suggestions = function(req, res, next) {
  let userId = req.session.user_info.userId;
  let access_token = req.session.token.access_token;

  findOneHistory(userId, (err, doc) => {
    if (err) {
      logger.error('MongoDB Error at load_suggestions in history.findOne(): ' + err);
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

function updateLoadingHistory(userId, callback) {
  let update = {
    'active.loadingStatus': true,
    'active.percentLoaded': DEFAULT_PERCENT_LOADED
  }

  upsertToHistory(userId, update, (err, doc) => {
    callback(err, doc);
  })

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

  upsertToHistory(userId, passiveUpdate);
}

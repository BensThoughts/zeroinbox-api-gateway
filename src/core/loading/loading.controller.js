/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');

// const mongooseUtils = require('../../libs/utils/mongoose.utils');
// const upsertToHistory = mongooseUtils.upsertToHistory;
// const findOneHistory = mongooseUtils.findOneHistory;
const {
  updateLoadingStatus,
  findOneLoadingStatus,
  findOneHistory,
  upsertToHistory,
} = require('../../libs/utils/mongoose.utils');

const {
  publishGetMessagesUserId,
  publishGetThreadsUserId 
} = require('../../libs/utils/rabbit.utils');


/**
 * The client can poll /loadingStatus to find out if the inbox is still loading.
 * After this comes back false the client can safely hit /suggestions endpoint
 * to gather all of the suggestions
 */
exports.loading_status = function (req, res) {

  let userId = req.session.user_info.userId;
  logger.trace(userId + ' - /v1/checkLoadingStatus');

  findOneLoadingStatus(userId, (err, loadingDoc) => {
    if (err) {
      logger.error(userId + ' - MongoDB Error at loading_status in history.findOne(): ' + err);
      res.status(500).json({
        status: 'error',
        status_message: 'internal server error at path /loadingStatus: Error getting loadingStatus'
      });
    } else {
      let ok = checkLoadingDoc(loadingDoc);
      if (ok) {
        let data = {
          loadingStatus: loadingDoc.loadingStatus,
          percentLoaded: loadingDoc.percentLoaded,
        }
        logger.trace(userId + ' - Loading Status: ' + JSON.stringify(data));
        res.status(200).json({ 
          status: 'success',
          status_message: 'OK',
          data: data
        });
      } else {
        logger.error(userId + ' - Was /loadSuggestions called before /loadingStatus? loadingDoc is null!');
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
  if (loadingDoc === undefined) {
    return false;
  }
  if (loadingDoc.loadingStatus === undefined) {
    return false;
  }
  if (loadingDoc.percentLoaded === undefined) {
    return false;
  }
  return true;
}

exports.first_run_status = function(req, res) {
  let userId = req.session.user_info.userId;

  logger.trace(userId + ' - Checking /firstRunStatus!');

  findOneHistory(userId, (err, doc) => {
    if (err) {
      logger.error(userId + ' - MongoDB Error at first_run_status in history.findOne(): ' + err);
      res.status(500).json({
        status: 'error',
        status_message: 'internal server error at path /firstRunStatus'
      });
    } else {
      // checkFirstRunEver() will return true if the doc or property does not exist
      // in which case we assume this is the first run ever.
      // if it does exist, we just return whatever value it has
      // it may have a value of true if we manually set it to true in the database
      // to force a re download of the users entire inbox while they wait
      // for trouble shooting, otherwise it will always be false
      let firstRunEver = checkFirstRunEver(doc);
      updatePassiveHistory(userId, firstRunEver);
      if (firstRunEver) {
        logger.trace(userId + ' - First Run Ever!');
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: firstRunEver
          }
        });
      } else {
        logger.trace(userId + '/firstRunStatus: ' + doc.passive.firstRun);
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

  load_suggestions_meta(userId, access_token, (response) => {
    let status_code = response.status_code;
    let status = response.status;
    let status_message = response.status_message;
    res.status(status_code).json({
      status: status,
      status_code: status_code,
      status_message: status_message
    });
  });
}


function load_suggestions_meta(userId, access_token, callback) {
  findOneLoadingStatus(userId, (err, doc) => {
    if (err) {
      logger.error(userId + ' - MongoDB Error at load_suggestions in history.findOne(): ' + err);
      callback({
        status: 'error',
        status_code: 500,
        status_message: 'Internal server error at path /loadSuggestions: DB Error, cannot load suggestions',
      });
    } else {
      let alreadyLoading = checkLoadingStatus(doc);
      if (alreadyLoading) {
        logger.trace(userId + ' - Tried to hit /loadSuggestions while already loading');
        callback({
          status: 'success',
          status_code: 200,
          status_message: 'Already Loading',
        });
      } else {
        publishGetMessagesUserId(userId, access_token);
        updateLoadingStatus(userId, (err, doc) => {
          // We need to always make sure that updateLoadingHistory succeeds before giving the user a response
          if (err) {
            logger.error(userId + ' - Error at load_suggestions in updateLoadingStatus(): ' + err);
            callback({
              status: 'error',
              status_code: 500,
              status_message: 'error at /loadSuggestions: error setting loadingStatus in database'
            });
          } else {
            logger.trace(userId + ' - Loading status updated in mongo to true');
            callback({
              status: 'success',
              status_code: 200,
              status_message: 'OK'
            });
          } 
        });
      }
    }
  });

}

exports.load_suggestions_meta = load_suggestions_meta;

function checkLoadingStatus(doc) {
  if (doc === null || !doc) {
    return false;
  }
  if (doc === undefined) {
    return false;
  }
  if (doc.loadingStatus === undefined) {
    return false;
  }
  return doc.loadingStatus;
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


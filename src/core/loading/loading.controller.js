const logger = require('../../libs/loggers/log4js');
const {
  updateLoadingStatus,
  findOneLoadingStatus,
  findOneHistory,
  upsertToHistory,
} = require('../../libs/utils/mongoose.utils');

const {
  publishGetMessagesUserId,
} = require('../../libs/utils/rabbit.utils');


/**
 * The client can poll /loadingStatus to find out if the inbox is still loading.
 * After this comes back false the client can safely hit /senders endpoint
 * to gather all of the senders
 */

exports.loadingStatus = function(req, res) {
  const userId = req.session.userInfo.userId;
  logger.trace(userId + ' - /v1/loadingStatus');

  findOneLoadingStatus(userId, (err, loadingDoc) => {
    if (err) {
      logger.error(userId + ' - MongoDB Error in findOneLoadingStatus: ' + err);
      const resError = 'Server error at /loadingStatus: ' + err;
      res.status(500).json({
        status: 'error',
        status_message: resError,
      });
    } else {
      const ok = checkLoadingDoc(loadingDoc);
      if (ok) {
        const data = {
          loadingStatus: loadingDoc.loadingStatus,
          percentLoaded: loadingDoc.percentLoaded,
        };
        logger.trace(userId + ' - Loading Status: ' + JSON.stringify(data));
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: data,
        });
      } else {
        logger.error(userId +
            ' - Was /loadSenders called? loadingDoc is null!');
        res.status(400).json({
          status: 'error',
          status_message:
            'Error checking /loadingStatus: Did you call /loadSenders first?',
        });
      }
    }
  });
};

/**
 * @param  {LoadingStatus} loadingDoc
 * @return {boolean}
 */
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

exports.firstRunStatus = function(req, res) {
  const userId = req.session.userInfo.userId;

  logger.trace(userId + ' - Checking /firstRunStatus!');

  findOneHistory(userId, (err, doc) => {
    if (err) {
      logger.error(userId +
        ' - MongoDB Error at first_run_status in history.findOne(): ' + err);
      res.status(500).json({
        status: 'error',
        status_message: 'internal server error at path /firstRunStatus',
      });
    } else {
      // checkFirstRunEver() will return true if the doc or property does not
      // exist in which case we assume this is the first run ever. If it does
      // exist, we just return whatever value it has it may have a value of
      // true if we manually set it to true in the database to force a
      // re-download of the users entire inbox while they wait for
      // trouble shooting, otherwise it will always be false
      const firstRunEver = checkFirstRunEver(doc);
      updatePassiveHistory(userId, firstRunEver);
      if (firstRunEver) {
        logger.trace(userId + ' - First Run Ever!');
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: firstRunEver,
          },
        });
      } else {
        logger.trace(userId + ' - /firstRunStatus: ' + doc.passive.firstRun);
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: doc.passive.firstRun,
          },
        });
      }
    }
  });
};

/**
 * @param  {History} doc
 * @return {boolean}
 */
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

exports.loadSenders = function(req, res, next) {
  const userId = req.session.userInfo.userId;
  const accessToken = req.session.token.accessToken;

  loadSendersMeta(userId, accessToken, (response) => {
    const statusCode = response.status_code;
    const status = response.status;
    const statusMessage = response.status_message;
    res.status(statusCode).json({
      status: status,
      status_code: statusCode,
      status_message: statusMessage,
    });
  });
};

/**
 * @param  {string} userId
 * @param  {string} accessToken
 * @param  {Function} callback
 */
exports.loadSendersMeta = function(userId, accessToken, callback) {
  findOneLoadingStatus(userId, (err, doc) => {
    if (err) {
      logger.error(userId +
        ' - MongoDB Error at load_suggestions in history.findOne(): ' + err);
      callback({
        status: 'error',
        status_code: 500,
        status_message: 'Internal server error at path /loadSenders: ' +
                        'DB Error, cannot load suggestions',
      });
    } else {
      const alreadyLoading = checkLoadingStatus(doc);
      if (alreadyLoading) {
        logger.trace(userId +
          ' - Tried to hit /loadSenders while already loading');
        callback({
          status: 'success',
          status_code: 200,
          status_message: 'Already Loading',
        });
      } else {
        publishGetMessagesUserId(userId, accessToken);
        updateLoadingStatus(userId, (err, doc) => {
          // We need to always make sure that updateLoadingStatus
          // succeeds before giving the user a response
          if (err) {
            logger.error(userId +
              ' - Error at load_suggestions in updateLoadingStatus(): ' + err);
            callback({
              status: 'error',
              status_code: 500,
              status_message: 'error at /loadSuggestions: ' +
                              'error setting loadingStatus in database',
            });
          } else {
            logger.trace(userId + ' - Loading status updated in mongo to true');
            callback({
              status: 'success',
              status_code: 200,
              status_message: 'OK',
            });
          }
        });
      }
    }
  });
};

/**
 * @param  {LoadingStatus} doc
 * @return {boolean}
 */
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

/**
 * @param  {string} userId
 * @param  {boolean} firstRunEver
 */
function updatePassiveHistory(userId, firstRunEver) {
  let passiveUpdate;

  if (firstRunEver) {
    passiveUpdate = {
      'userId': userId,
      'passive.firstRun': true,
      'passive.firstRunDate': new Date(),
      'passive.lastRunDate': new Date(),
    };
  } else {
    passiveUpdate = {
      'userId': userId,
      'passive.lastRunDate': new Date(),
    };
  }

  upsertToHistory(userId, passiveUpdate);
}


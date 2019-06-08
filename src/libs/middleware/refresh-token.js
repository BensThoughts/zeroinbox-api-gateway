const logger = require('../loggers/log4js');
const {
    findStoredSession,
    upsertToHistory,
} = require('../utils/mongoose.utils');
const {
  httpRefreshTokenRequest
} = require('../utils/api.utils');
const {
  load_suggestions_meta
} = require('../../core/loading/loading.controller')


function refreshToken(req, res, next) {
    let path = req.path;
    switch(path) {
      case '/v1/oauth2init':
        return next();
      case '/v1/oauth2callback':
        return next();
      case '/v1/basicProfile':
        return next();
      default:
        return checkRefreshToken(req, res, next);
    }
}

function checkRefreshToken(req, res, next) {
    let userId = req.session.user_info.userId;
    let currentDate = new Date().getTime();
    let expiry_date = req.session.token.expiry_date; // in millis since epoch

    logger.trace('CURREN DATE: ' + currentDate);
    logger.trace('EXPIRY DATE: ' + expiry_date);


    if (currentDate >= expiry_date) {
      logger.trace('Refreshing token for userId: ' + userId);
      
      findStoredSession(userId, (err, storedSession) => {
        if (err) {
          logger.error(err);
          return res.status(401).json({
            status: 'error',
            status_message: 'Error obtaining new access_token with refresh_token!'
          });
        } else if (storedSession === null) {
          logger.error('findStoredSession(userId, (err, storedSession)): storedSession === null');
          return res.status(401).json({
            status: 'error',
            status_message: 'Error obtaining new access_token with refresh_token!'
          });
        } else {
          storedSession = storedSession.active.session; // This is rather hacky, need better var names
          // storedSession = activeSession.active.session;
          // let currentDate = new Date().getTime();
          // let expiry_date = session.expiry_date;
          let refresh_token = storedSession.refresh_token;
  
          httpRefreshTokenRequest(refresh_token).then((response) => {
            logger.trace(response);
            let parsedResponse = JSON.parse(response);
    
            let expires_in = parsedResponse.expires_in; // this is in seconds, always 3600
            // let expiry_date = req.session.token.expiry_date; // this is in milli (epoch)
            let new_expiry_date = currentDate + (expires_in * 1000);
            logger.trace('NEW EXPIRY DATE: ' + new_expiry_date);
  
            let new_access_token = parsedResponse.access_token;
            
            req.session.token.access_token = new_access_token;
            req.session.token.expiry_date = new_expiry_date;
  
            sendNewTokenToMongo(userId, new_access_token, new_expiry_date);
  
            load_suggestions_meta(userId, new_access_token, (loadingResponse) => {
              logger.trace('Reload senders from token refresh: ' + JSON.stringify(loadingResponse));
            });
  
            return next();
          }).catch((err) => {
            logger.error(err);
            return res.status(401).json({
              status: 'error',
              status_message: 'Error obtaining new access_token with refresh_token!'
            });
          });
        }
      });

    } else {
      return next();
    }
}

function sendNewTokenToMongo(userId, access_token, expiry_date) {
  let update = {
    "userId": userId,
    "active.session.access_token": access_token,
    "active.session.expiry_date": expiry_date
  }
  upsertToHistory(userId, update, (err, res) => {
    logger.trace(res);
  });
}

module.exports = refreshToken;
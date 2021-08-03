const logger = require('../loggers/log4js');
const {
    findRefreshToken,
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
      // case '/v1/oauth2init':
      //  return next();
      // case '/v1/oauth2callback':
      //  return next();
      // case '/v1/basicProfile':
      //  return next();
      case '/v1/senders':
        return checkRefreshToken(req, res, next);

      case '/v1/actions':
        return checkRefreshToken(req, res, next);
      
      default:
        return next();
      // default:
      //  return checkRefreshToken(req, res, next);
    }
}

function checkRefreshToken(req, res, next) {
    let userId = req.session.userInfo.userId;
    let currentDate = new Date().getTime();
    let expiryDate = req.session.token.expiryDate; // in millis since epoch

    if (currentDate >= expiryDate) {
      logger.trace(userId + ' - Refreshing token!');
      
      findRefreshToken(userId, (err, refreshToken) => {
        if (err) {
          logger.error(userId + ' - ' + err);
          return res.status(401).json({
            status: 'error',
            status_message: 'Error obtaining new accessToken with refreshToken!'
          });
        } else if (refreshToken === null) {
          logger.error(userId + ' - findStoredSession(userId, (err, storedSession)): storedSession === null');
          return res.status(401).json({
            status: 'error',
            status_message: 'Error obtaining new accessToken with refreshToken!'
          });
        } else {
          logger.trace(userId + ' - Refresh token: ' + refreshToken);
  
          httpRefreshTokenRequest(refreshToken).then((response) => {
            let parsedResponse = JSON.parse(response);
    
            let expiresIn = parsedResponse.expires_in; // this is in seconds, always 3600
            // let expiryDate = req.session.token.expiryDate; // this is in milli (epoch)
            const TEN_MINUTES = 600000;
            let newExpiryDate = currentDate + (expiresIn * 1000) - TEN_MINUTES;
            logger.trace('NEW EXPIRY DATE: ' + newExpiryDate);
  
            let newAccessToken = parsedResponse.access_token;

            logger.trace(userId + ' - New access token: ' + newAccessToken);
            logger.trace(userId + ' - New expiry date: ' + newExpiryDate);
            
            req.session.token.accessToken = newAccessToken;
            req.session.token.expiryDate = newExpiryDate;
  
            sendNewTokenToMongo(userId, newAccessToken, newExpiryDate);
  
            load_suggestions_meta(userId, newAccessToken, (loadingResponse) => {
              logger.trace('Reload senders from token refresh: ' + JSON.stringify(loadingResponse));
            });
  
            return next();
          }).catch((httpErr) => {
            logger.error(userId + ' - ' + JSON.stringify(httpErr));
            return res.status(401).json({
              status: 'error',
              status_message: 'Error obtaining new accessToken with refreshToken!'
            });
          });
        }
      });

    } else {
      return next();
    }
}

function sendNewTokenToMongo(userId, accessToken, expiryDate) {
  let update = {
    "userId": userId,
    "active.session.accessToken": accessToken,
    "active.session.expiryDate": expiryDate
  }
  upsertToHistory(userId, update, (err, res) => {
    if (err) return logger.error(userId + ' - ' + err);
  });
}

module.exports = refreshToken;
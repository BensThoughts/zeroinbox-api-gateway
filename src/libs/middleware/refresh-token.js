const logger = require('../loggers/log4js');
const {
    findStoredSession,
    upsertToHistory,
} = require('../utils/mongoose.utils');
const {
  httpRefreshTokenRequest
} = require('../utils/api.utils');


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
    let expiry_date = req.session.expiry_date;
    
    if (currentDate >= expiry_date) {
      findStoredSession(userId, (err, activeSession) => {
        let session = activeSession.active.session;
        // let currentDate = new Date().getTime();
        // let expiry_date = session.expiry_date;
        let refresh_token = session.refresh_token;

        httpRefreshTokenRequest(refresh_token).then((response) => {
          let parsedResponse = JSON.parse(response);
  
          let expires_in = parsedResponse.expires_in; // this is in seconds, always 3600
          let expiry_date = req.session.token.expiry_date; // this is in milli (epoch)
          let new_expiry_date = expiry_date + (expires_in * 1000);
          let new_access_token = parsedResponse.access_token;
          
          req.session.token.access_token = new_access_token;
          req.session.token.expiry_date = new_expiry_date;

          sendNewTokenToMongo(userId, new_access_token, new_expiry_date);

          return next();
        }).catch((err) => {
          logger.err(err);
          return res.status(401).json({
            status: 'error',
            status_message: 'Error obtaining new access_token with refresh_token!'
          });
        });
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
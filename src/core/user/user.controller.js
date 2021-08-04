const logger = require('../../libs/loggers/log4js');
const crypto = require('crypto');
const {
  httpGetRequest,
} = require('../../libs/utils/api.utils');
const {
  upsertToHistory,
  upsertToProfile,
} = require('../../libs/utils/mongoose.utils');
const {
  BASIC_PROFILE_ENDPOINT,
  GMAIL_PROFILE_ENDPOINT,
} = require('../../config/init.config');

/**
Get Basic Profile
*****************************************************************************/

exports.basicProfile = function(req, res) {
  const token = req.session.token;
  const sessionID = req.sessionID;
  const accessToken = token.accessToken;

  httpGetRequest(
      BASIC_PROFILE_ENDPOINT,
      accessToken,
  ).then((basicProfileResponse) => {
    const basicProfile = JSON.parse(basicProfileResponse);
    const userId = basicProfile.id;

    req.session.userInfo = {
      userId: userId,
      emailId: '',
      emailAddress: '',
    };

    // need to make sure userId is in express-session before client proceeds
    res.json({
      status: 'success',
      status_message: 'OK',
      data: {
        basic_profile: basicProfile,
      },
    });
    sendTokenToMongo(userId, token, sessionID);
    sendBasicProfileToMongo(userId, basicProfile);
  }).catch((err) => {
    logger.error('Error in getBasicProfile(): ' + err);
    res.status(500).json({
      status: 'error',
      status_message: 'Google Api Error at /basicProfile: ' +
                      'error contacting googleApi',
    });
  });
};

/**
 * @param  {string} userId
 * @param  {basicProfileSchema} basicProfile
 */
function sendBasicProfileToMongo(userId, basicProfile) {
  const profileUpdate = {
    userId: userId,
    basic: {
      id: basicProfile.id,
      name: basicProfile.name,
      given_name: basicProfile.given_name,
      family_name: basicProfile.family_name,
      link: basicProfile.link,
      picture: basicProfile.picture,
      locale: basicProfile.locale,
    },
  };
  upsertToProfile(userId, profileUpdate, (err, doc) => {
    if (err) return logger.error(err);
    logger.trace('Basic profile updated!');
  });
}

/**
 * @param  {string} userId
 * @param  {GapiToken} token
 * @param  {string} sessionID
 */
function sendTokenToMongo(userId, token, sessionID) {
  let update;

  const refreshToken = token.refreshToken;
  if (refreshToken) {
    update = {
      'userId': userId,
      'active.session.sessionID': sessionID,
      'active.session.accessToken': token.accessToken,
      'active.session.expiryDate': token.expiryDate,
      'active.session.scope': token.scope,
      'active.session.tokenType': token.tokenType,
      'active.session.refreshToken': token.refreshToken,
      'active.loggedIn': true,
    };
  } else {
    update = {
      'userId': userId,
      'active.session.sessionID': sessionID,
      'active.session.accessToken': token.accessToken,
      'active.session.expiryDate': token.expiryDate,
      'active.session.scope': token.scope,
      'active.session.tokenType': token.tokenType,
      'active.loggedIn': true,
    };
  }

  upsertToHistory(userId, update, (err, doc) => {
    if (err) {
      return logger.error(
          'Error in /v1/basicProfile at sendTokenToMongo(): ' + err);
    }
    logger.trace('Token sent to mongo!');
  });
}

/**
Get Email Profile
*****************************************************************************/

exports.emailProfile = function(req, res) {
  const accessToken = req.session.token.accessToken;

  httpGetRequest(GMAIL_PROFILE_ENDPOINT, accessToken)
      .then((emailProfileResponse) => {
        const emailProfile = JSON.parse(emailProfileResponse);
        const userId = req.session.userInfo.userId;

        const md5sum = crypto.createHash('md5');

        md5sum.update(emailProfile.emailAddress);
        const emailId = md5sum.digest('hex');

        req.session.userInfo = {
          userId: userId,
          emailId: emailId,
          emailAddress: emailProfile.emailAddress,
        };

        // respond after writing emailId to the session so it is avail for every
        // other route called after
        res.status(200).json({
          status: 'success',
          status_message: 'OK',
          data: {
            email_profile: emailProfile,
          },
        });

        sendEmailProfileToMongo(userId, emailId, emailProfile);
      }).catch((err) => {
        logger.error('Error in getEmailProfile(): ' + err);
        res.status(500).json({
          status: 'error',
          status_message: 'Google Api Error at /emailProfile: ' +
                          'error contacting googleApi',
        });
      });
};

/**
 * @param  {string} userId
 * @param  {string} emailId
 * @param  {emailSchema} emailProfile
 */
function sendEmailProfileToMongo(userId, emailId, emailProfile) {
  const update = {
    userId: userId,
    email: {
      emailId: emailId,
      emailAddress: emailProfile.emailAddress,
      messagesTotal: emailProfile.messagesTotal,
      threadsTotal: emailProfile.threadsTotal,
      historyId: emailProfile.historyId,
    },
  };
  upsertToProfile(userId, update, (err, doc) => {
    if (err) return logger.error(err);
    logger.trace('Email profile updated!');
  });
}

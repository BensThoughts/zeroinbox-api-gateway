
/*******************************************************************************
  INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');
const crypto = require('crypto');

const Profile = require('../../models/profile.model');

const apiUtils = require('../../libs/utils/api.utils');
const httpRequest = apiUtils.httpRequest;

const mongooseUtils = require('../../libs/utils/mongoose.utils');
const upsertToHistory = mongooseUtils.upsertToHistory;
const upsertToProfile = mongooseUtils.upsertToProfile;

const {
  BASIC_PROFILE_ENDPOINT,
  GMAIL_PROFILE_ENDPOINT,
} = require('../../config/init.config');

/*******************************************************************************
Get Basic Profile
*******************************************************************************/

exports.basic_profile = function (req, res) {

  let token = req.session.token;
  let cookie = req.session.cookie;
  let access_token = token.access_token;

  httpRequest(BASIC_PROFILE_ENDPOINT, access_token).then((basic_profile_response) => {
      let basic_profile = JSON.parse(basic_profile_response);
      let userId = basic_profile.id;

      req.session.user_info = {
        userId: basic_profile.id,
        emailId: '',
        emailAddress: '',
      }

      // need to make sure userId is in express-session before client proceeds
      res.json({ 
        status: 'success',
        status_message: 'OK',
        data: {
          basic_profile: basic_profile 
        }
      });
      sendTokenToMongo(userId, token, cookie);
      sendBasicProfileToMongo(userId, basic_profile);
  }).catch((err) => {
    logger.error('Error in getBasicProfile(): ' + err);
    res.status(500).json({
      status: 'error',
      status_message: 'Google Api Error at /basicProfile: error contacting googleApi'
    });
  });

};

function sendBasicProfileToMongo(userId, basic_profile) {
  let profileUpdate = {
    userId: userId,
    basic: {
      id: basic_profile.id,
      name: basic_profile.name,
      given_name: basic_profile.given_name,
      family_name: basic_profile.family_name,
      link: basic_profile.link,
      picture: basic_profile.picture,
      locale: basic_profile.locale
    }
  };
  upsertToProfile(userId, profileUpdate, (err, doc) => {
    if (err) return logger.error(err);
    logger.debug('Basic profile updated!');
  });
}

function sendTokenToMongo(userId, token, cookie) {

  let update;

  let refresh_token = token.refresh_token;
  if (refresh_token) {
    update = {
      "userId": userId,
      "active.session.cookie": cookie,
      "active.session.access_token": token.access_token,
      "active.session.expiry_date": token.expiry_date,
      "active.session.scope": token.scope,
      "active.session.token_type": token.token_type,
      "active.session.refresh_token": token.refresh_token
    }
  } else {
    update = {
      "userId": userId,
      "active.session.cookie": cookie,
      "active.session.access_token": token.access_token,
      "active.session.expiry_date": token.expiry_date,
      "active.session.scope": token.scope,
      "active.session.token_type": token.token_type,
    }
  }

  upsertToHistory(userId, update, (err, doc) => {
    if (err) return logger.error('Error in sendTokenToMongo(): ' + err);
    logger.debug('Token sent to mongo!');
  });
}

/*******************************************************************************
Get Email Profile
*******************************************************************************/

exports.email_profile = function (req, res) {

  let access_token = req.session.token.access_token;

  httpRequest(GMAIL_PROFILE_ENDPOINT, access_token).then((email_profile_response) => {
    let email_profile = JSON.parse(email_profile_response);
    let userId = req.session.user_info.userId;

    let md5sum = crypto.createHash('md5');

    md5sum.update(email_profile.emailAddress);
    let emailId = md5sum.digest('hex');

    req.session.user_info = {
      userId: userId,
      emailId: emailId,
      emailAddress: email_profile.emailAddress
    };

    // respond after writing emailId to the session so it is avail for every
    // other route called after
    res.status(200).json({
      status: 'success',
      status_message: 'OK',
      data: {
        email_profile: email_profile
      } 
    });

    sendEmailProfileToMongo(userId, emailId, email_profile);
  }).catch((err) => {
    logger.error('Error in getEmailProfile(): ' + err);
    res.status(500).json({
      status: 'error',
      status_message: 'Google Api Error at /emailProfile: error contacting googleApi'
    });
  });
}

function sendEmailProfileToMongo(userId, emailId, email_profile) {
  let update = {
    userId: userId,
    email: {
      emailId: emailId,
      emailAddress: email_profile.emailAddress,
      messagesTotal: email_profile.messagesTotal,
      threadsTotal: email_profile.threadsTotal,
      historyId: email_profile.historyId
    }
  };
  upsertToProfile(userId, update, (err, doc) => {
    if(err) return logger.error(err);
    logger.debug('Email profile updated!');
  });
}

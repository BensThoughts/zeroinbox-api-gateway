
/*******************************************************************************
  INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');
const request = require('request');
const crypto = require('crypto');

const Profile = require('../models/profile.model');
const History = require('../models/history.model');

const apiUtils = require('../../libs/utils/api.utils');
const httpRequest = apiUtils.httpRequest;

const {
  BASIC_PROFILE_ENDPOINT,
  GMAIL_PROFILE_ENDPOINT,
  GAPI_DELAY_MULTIPLIER,
  GAPI_MAX_RETRIES,
  GAPI_INIT_RETRY_DELAY
} = require('../../config/init.config');

/*******************************************************************************
Get Basic Profile
*******************************************************************************/

/* function getBasicProfile(access_token) {
  let retries = GAPI_MAX_RETRIES;
  let delay = GAPI_INIT_RETRY_DELAY;
  let delayMultiplier = GAPI_DELAY_MULTIPLIER;
  let promiseCreator = () => getBasicProfilePromise(access_token);
  return retryPromise(promiseCreator, retries, delay, delayMultiplier);
}

function getBasicProfilePromise(access_token) {
  
  const options = {
    url: BASIC_PROFILE_ENDPOINT,
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };

  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    })
  });
} */

exports.basic_profile = function (req, res) {

  let access_token = req.session.token.access_token;

  httpRequest(BASIC_PROFILE_ENDPOINT, access_token).then((basic_profile_response) => {

    if (basic_profile_response) {
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
  
      const conditions = { userId: userId };
      let options = {
        multi: false,
        upsert: true
      };
  
      let activeUpdate;
  
      let refresh_token = req.session.token.refresh_token;
      if (refresh_token) {
        activeUpdate = {
          "active.session.cookie": req.headers.cookie,
          "active.session.access_token": req.session.token.access_token,
          "active.session.expiry_date": req.session.token.expiry_date,
          "active.session.scope": req.session.token.scope,
          "active.session.token_type": req.session.token.token_type,
          "active.session.refresh_token": req.session.token.refresh_token
        }
      } else {
        activeUpdate = {
          "active.session.cookie": req.headers.cookie,
          "active.session.access_token": req.session.token.access_token,
          "active.session.expiry_date": req.session.token.expiry_date,
          "active.session.scope": req.session.token.scope,
          "active.session.token_type": req.session.token.token_type,
        }
      }
      let historyUpdate = {
        ...activeUpdate,
      }
      logger.debug(historyUpdate);
      History.updateOne(conditions, historyUpdate, options, (err, doc) => {
        if (err) {
          logger.error(err)
        } else {
          logger.debug('History updated!');
        };
      });
  
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
       
      Profile.updateOne(conditions, profileUpdate, options, (err, doc) => {
        if (err) return logger.error(err);
        logger.debug('Basic profile updated!');
      });
    }

  }).catch((err) => {
    logger.error('Error in getBasicProfile(): ' + err);
    res.status(500).json({
      status: 'error',
      status_message: 'Google Api Error at /basicProfile: error contacting googleApi'
    });
  });

};

/*******************************************************************************
Get Email Profile
*******************************************************************************/



/* function getEmailProfile(access_token) {
  let retries = GAPI_MAX_RETRIES;
  let delay = GAPI_INIT_RETRY_DELAY;
  let delayMultiplier = GAPI_DELAY_MULTIPLIER;
  let promiseCreator = () => getEmailProfilePromise(access_token);
  return retryPromise(promiseCreator, retries, delay, delayMultiplier);
}


function getEmailProfilePromise(access_token) {

  const options = {
    url: GMAIL_PROFILE_ENDPOINT,
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };

  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });

} */

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

    let conditions = { userId: userId };
    let profileUpdate = {
      userId: userId,
      email: {
        emailId: emailId,
        emailAddress: email_profile.emailAddress,
        messagesTotal: email_profile.messagesTotal,
        threadsTotal: email_profile.threadsTotal,
        historyId: email_profile.historyId
      }
    };
    let options = {
      multi: false,
      upsert: true
    };

    Profile.updateOne(conditions, profileUpdate, options, (err, doc) => {
      if(err) return logger.error(err);
      logger.debug('Email profile updated!');
    });

  }).catch((err) => {
    logger.error('Error in getEmailProfile(): ' + err);
    res.status(500).json({
      status: 'error',
      status_message: 'Google Api Error at /emailProfile: error contacting googleApi'
    });
  });
}

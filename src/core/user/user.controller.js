
/*******************************************************************************
  INIT DEPS
*******************************************************************************/
const logger = require('../../loggers/log4js');
const request = require('request');
const crypto = require('crypto');

/*******************************************************************************
 MONGOOSE INIT
*******************************************************************************/

const Profile = require('../models/profile.model');
const History = require('../models/history.model');

const GOOGLE_USER_INFO_ENDPOINT =  'https://www.googleapis.com/oauth2/v2/userinfo';
const GMAIL_PROFILE_ENDPOINT = 'https://www.googleapis.com/gmail/v1/users/me/profile';

/*******************************************************************************
Get Basic Profile
*******************************************************************************/

exports.basic_profile = function (req, res) {

  let access_token = req.session.token.access_token;

  const options = {
    url: GOOGLE_USER_INFO_ENDPOINT,
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };

  let getBasicProfile = new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    })
  })

  getBasicProfile.then((basic_profile_response) => {
    let basic_profile = JSON.parse(basic_profile_response);

    let userId = basic_profile.id;
    req.session.user_info = {
      userId: basic_profile.id,
      emailId: '',
      emailAddress: '',
    }

      const conditions = { userId: userId };
      let options = {
        multi: false,
        upsert: true
      };
      History.findOne(conditions, (err, doc) => {
        let historyUpdate = {
        }
        if (doc === null) { // doc === null indicates first run
          historyUpdate = {
            passive: {
              firstRun: true,
              firstRunDate: new Date(),
              lastRunDate: new Date()
            }
          }
        } else {
          historyUpdate = {
            "passive.lastRunDate": new Date()
          }
        }
        History.updateOne(conditions, historyUpdate, options, (err, doc) => {
          logger.trace('HISTORY UPDATED');

          // need to make sure firstRun is in db and userId is in express-session
          // before client proceeds
          res.json({ basic_profile: basic_profile });
        });
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
        if (err) return console.error(err);
        logger.debug('Basic profile updated!');
      })

  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });

};


/*******************************************************************************
Get Email Profile
*******************************************************************************/
exports.email_profile = function (req, res) {

  let access_token = req.session.token.access_token;

  const options = {
    url: GMAIL_PROFILE_ENDPOINT,
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };

  let getEmailProfile = new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    })
  });

  getEmailProfile.then((email_profile_response) => {
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

    // respode after writing emailId to the session so it is avail for every
    // other route called after
    res.json({ email_profile: email_profile });

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
      if(err) return console.error(err);
      logger.debug('Email profile updated!');
    });

  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });

}

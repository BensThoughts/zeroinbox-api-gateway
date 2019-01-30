
/*******************************************************************************
  INIT CHALK
*******************************************************************************/
const chalk = require('chalk');


const request = require('request');

/*******************************************************************************
 HASHING INIT
*******************************************************************************/
const crypto = require('crypto');


var Profile = require('../models/profile.schema');
// const mongoose = require('mongoose');
const configDB = require('../../config/database');
// const mongodb = require('mongodb');
const mongoose = require('mongoose');
// const client = mongodb.MongoClient;

/*******************************************************************************
Get Basic Profile and Email Profile
*******************************************************************************/

exports.basic_profile = function (req, res) {

  let access_token = req.session.token.access_token;

  const options = {
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
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

    // console.log(basic_profile);
    let userId = basic_profile.id;
    req.session.user_info = {
      userId: basic_profile.id,
      emailId: '',
      emailAddress: '',
    }

    // respond after writing userId to the session so it is avail
    // when we call every other route
    res.json({ basic_profile: basic_profile });

    mongoose.connect(configDB.url, {useNewUrlParser: true});

    let db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', function() {

      let conditions = { userId: userId };
      let update = {
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
      let options = {
        multi: false,
        upsert: true
      };

      Profile.findOneAndUpdate(conditions, update, options, (err, raw) => {
        if(err) return console.error(chalk.red(err));
        console.log('basic profile updated');
      });

    });



  }).catch((err) => {
    console.error(chalk.red(err));
    res.status(500).send('Error: ' + err);
  });

};

exports.email_profile = function (req, res) {
  // console.log('test: ' + req.session.test);
  let access_token = req.session.token.access_token;
  // console.log('email userId: ' + userId)

  const options = {
    url: 'https://www.googleapis.com/gmail/v1/users/me/profile',
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

    mongoose.connect(configDB.url, {useNewUrlParser: true});

    let db = mongoose.connection;


    let md5sum = crypto.createHash('md5');

    md5sum.update(email_profile.emailAddress);
    // console.log(x);
    // console.log(md5sum.digest('hex'));
    let emailId = md5sum.digest('hex');

    req.session.user_info = {
      userId: userId,
      emailId: emailId,
      emailAddress: email_profile.emailAddress
    };

    // respode after writing emailId to the session so it is avail for every
    // other route called after
    res.json({ email_profile: email_profile });

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', function() {


      let conditions = { userId: userId };
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
      let options = {
        multi: false,
        upsert: true
      };

      Profile.findOneAndUpdate(conditions, update, options, (err, raw) => {
        if(err) return console.error(chalk.red(err));
        console.log('email profile updated');
      });

    });


  }).catch((err) => {
    console.error(chalk.red(err));
    res.status(500).send('Error: ' + err);
  });

}

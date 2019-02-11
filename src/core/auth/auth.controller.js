/*******************************************************************************
 * INIT DEPS
*******************************************************************************/
const logger = require('../../loggers/log4js');

const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
const gmail = google.gmail('v1');

// seems that when you use readFileSync it takes whatever dir node was started
// in as the base dir
const client_secret = path.resolve(__dirname, '../../config/client_secret.json');
const clientSecretJson = JSON.parse(fs.readFileSync(client_secret));

const googleApi = require('../../index');

const rabbit = require('rabbot');
const publish = require('../../helpers/rabbit.helper');
/*******************************************************************************
 * OAuth2 Init
*******************************************************************************/
exports.oauth2init = function(req, res) {

  const oauth2Client = new google.auth.OAuth2(
    clientSecretJson.web.client_id,
    clientSecretJson.web.client_secret,
    'http://127.0.0.1:3000/oauth2callback'
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account',
  });

  // Reset the session after init because leaving the site to log in
  // and then coming back to it after login creates 2 sessions, and one
  // is empty
  req.session.destroy();

  if (authUrl === undefined) {
    res.json({ 
      status: 'error', 
      status_message: 'Error obtaining authUrl'
    })
  }

  res.json({
    status: 'success', 
    status_message: 'OK',
    data: {
      auth_url: authUrl
    }
  });

};

/*******************************************************************************
 * OAuth2 Callback
*******************************************************************************/
exports.oauth2callback = function(req, res) {

  const code = req.query.code;

  const oauth2Client = new google.auth.OAuth2(
    clientSecretJson.web.client_id,
    clientSecretJson.web.client_secret,
    'http://127.0.0.1:3000/oauth2callback'
  );

  oauth2Client.getToken(code, (err, token) => {
      if (err) {
        logger.error('Error in oauth2Client.getToken(): ' + err);
        res.status(500).send('Something went wrong: check the logs.');// reject(err);
      }

      logger.debug(token);

      req.session.token = {
        access_token: token.access_token,
        scope: token.scope,
        token_type: token.token_type,
        expiry_date: token.expiry_date
      };

      // res.cookie('c_tok', my_token);
      res.redirect('http://127.0.0.1:4200/loading');
  });

};

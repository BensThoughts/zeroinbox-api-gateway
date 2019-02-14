/*******************************************************************************
 * INIT DEPS
*******************************************************************************/
const logger = require('../../loggers/log4js');

const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
// const gmail = google.gmail('v1');

const {
G_OAUTH_CLIENT_ID,
G_OAUTH_CLIENT_SECRET,
G_OAUTH_REDIRECT_URL,
G_OAUTH_ACCESS_TYPE,
G_OAUTH_PROMPT,
ZERO_INBOX_REDIRECT_URL,
G_OAUTH_SCOPES
} = require('../../config/auth.config');

const SCOPES = G_OAUTH_SCOPES.split(',');


// seems that when you use readFileSync it takes whatever dir node was started
// in as the base dir
// const client_secret = path.resolve(__dirname, '../../config/client_secret.json');
// const clientSecretJson = JSON.parse(fs.readFileSync(client_secret));

/*******************************************************************************
 * OAuth2 Init
*******************************************************************************/
exports.oauth2init = function(req, res) {

  const oauth2Client = new google.auth.OAuth2(
    G_OAUTH_CLIENT_ID,
    G_OAUTH_CLIENT_SECRET,
    G_OAUTH_REDIRECT_URL
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: G_OAUTH_ACCESS_TYPE,
    scope: SCOPES,
    prompt: G_OAUTH_PROMPT,
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
    G_OAUTH_CLIENT_ID,
    G_OAUTH_CLIENT_SECRET,
    G_OAUTH_REDIRECT_URL
  );

  oauth2Client.getToken(code, (err, token) => {
      if (err) {
        logger.error('Error in oauth2Client.getToken(): ' + err);
        res.status(500).send('Something went wrong: check the logs.');// reject(err);
      }

      logger.debug('This Token: ' + token);

      let refresh_token = token.refresh_token;

      logger.debug('Refresh token: ' + refresh_token);

      req.session.token = {
        access_token: token.access_token,
        scope: token.scope,
        token_type: token.token_type,
        expiry_date: token.expiry_date,
        refresh_token: refresh_token
      };

      // res.cookie('c_tok', my_token);
      res.redirect(ZERO_INBOX_REDIRECT_URL);
  });

};

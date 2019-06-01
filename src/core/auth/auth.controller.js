/*******************************************************************************
 * INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');
const {google} = require('googleapis');

const {
  client_id,
  client_secret,
  oauth_redirect_url,
  access_type,
  prompt,
  auth_success_redirect_url,
  auth_failure_redirect_url,
  scope,
} = require('../../config/auth.config');


/*******************************************************************************
 * OAuth2 Init
*******************************************************************************/
exports.oauth2init = function(req, res) {

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    oauth_redirect_url
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: access_type,
    scope: ['https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/userinfo.profile'],
    // scope: scope,
    prompt: prompt,
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

  if (code === undefined || !code) {
    res.redirect(auth_failure_redirect_url)
  } else {

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      oauth_redirect_url
    );

    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        logger.error('Error in oauth2Client.getToken(): ' + err);
        res.status(500).send('Something went wrong: check the logs.');// reject(err);
      }
      let refresh_token = token.refresh_token;
      logger.debug('Token: ' + token);

      req.session.token = {
        access_token: token.access_token,
        scope: token.scope,
        token_type: token.token_type,
        expiry_date: token.expiry_date,
        refresh_token: refresh_token
      };

      // res.cookie('c_tok', my_token);
      res.redirect(auth_success_redirect_url);
    });

  }

};

exports.logout = function(req, res) {
  req.session.destroy();
  res.json({
    status: 'success',
    status_message: 'OK',
    data: {
      message: 'Session Reset!'
    }
  });
}

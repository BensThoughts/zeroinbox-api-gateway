/**
 * INIT DEPS
*******************************************************************************/
const logger = require('../../libs/loggers/log4js');
const {google} = require('googleapis');

const {
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_REDIRECT_URL,
  ACCESS_TYPE,
  PROMPT,
  AUTH_SUCCESS_REDIRECT_URL,
  AUTH_FAILURE_REDIRECT_URL,
} = require('../../config/auth.config');

const {
  upsertToHistory,
} = require('../../libs/utils/mongoose.utils');


/**
 * OAuth2 Init
*****************************************************************************/

exports.oauth2init = function(req, res) {
  const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      OAUTH_REDIRECT_URL,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: ACCESS_TYPE,
    scope: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.settings.basic',
    ],
    prompt: PROMPT,
  });

  // Reset the session after init because redirect from website to login
  // and then coming back to it after login creates 2 sessions, and one
  // is empty
  req.session.destroy();

  if (authUrl === undefined) {
    res.json({
      status: 'error',
      status_message: 'Error obtaining authUrl',
    });
  }

  res.json({
    status: 'success',
    status_message: 'OK',
    data: {
      auth_url: authUrl,
    },
  });
};

/**
 * OAuth2 Callback
*****************************************************************************/

exports.oauth2callback = function(req, res) {
  const code = req.query.code;

  if (code === undefined || !code) {
    res.redirect(AUTH_FAILURE_REDIRECT_URL);
  } else {
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        OAUTH_REDIRECT_URL,
    );

    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        logger.error('Error in oauth2Client.getToken(): ' + err);
        return res
            .status(500)
            .send('Something went wrong: check the logs.');
      }

      const accessToken = token.access_token;
      const scope = token.scope;
      const tokenType = token.token_type;

      const refreshToken = token.refresh_token;

      const TEN_MINUTES = 600000;
      const expiryDate = token.expiry_date - TEN_MINUTES;

      req.session.token = {
        accessToken: accessToken,
        scope: scope,
        tokenType: tokenType,
        expiryDate: expiryDate,
        refreshToken: refreshToken,
      };

      res.redirect(AUTH_SUCCESS_REDIRECT_URL);
    });
  }
};

exports.logout = function(req, res) {
  const userId = req.session.userInfo.userId;
  req.session.destroy();

  const historyUpdate = {
    'userId': userId,
    'active.loggedIn': false,
  };

  upsertToHistory(userId, historyUpdate, (err, response) => {
    if (err) return logger.error(err);
  });

  logger.trace('Logged out successfully');

  res.json({
    status: 'success',
    status_message: 'OK',
    data: {
      message: 'Session Reset!',
    },
  });
};

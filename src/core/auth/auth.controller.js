/*******************************************************************************
 * INIT DEPS
*******************************************************************************/
const fs = require('fs');
const {google} = require('googleapis');
const gmail = google.gmail('v1');

// seems that when you use readFileSync it takes whatever dir node was started
// in as the base dir
const clientSecretJson = JSON.parse(fs.readFileSync('./config/client_secret.json'));


/*******************************************************************************
 * OAuth2 Init
*******************************************************************************/
exports.oauthinit = function(req, res) {

  const oauth2Client = new google.auth.OAuth2(
    clientSecretJson.web.client_id,
    clientSecretJson.web.client_secret,
    'http://127.0.0.1:3000/oauth2callback'
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    // 'profile',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes
  });

  // Reset the session after init because leaving the site to log in
  // and then coming back to it after login creates 2 sessions, and one
  // is empty
  req.session.destroy();

  res.json({ authUrl: authUrl });

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
        console.error(chalk.red(err));
        res.status(500).send('Something went wrong: check the logs.');// reject(err);
      }

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

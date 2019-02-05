/*******************************************************************************
Get All Labels
*******************************************************************************/
const request = require('request');

exports.get_labels = function (req, res) {

  let access_token = req.session.token.access_token;

  const options = {
    url: 'https://www.googleapis.com/gmail/v1/users/me/labels',
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
  })

  getEmailProfile.then((labels_response) => {
    let labels = JSON.parse(labels_response);
    res.json(labels);
  }).catch((err) => {
    logger.error('Error in /labels at getEmailProfile.then(): ' + err);
    res.status(500).send('Error: ' + err);
  });

}

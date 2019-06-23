const logger = require('../loggers/log4js');
const request = require('request');

const {
  GAPI_DELAY_MULTIPLIER,
  GAPI_MAX_RETRIES,
  GAPI_INIT_RETRY_DELAY,
  OAUTH_TOKEN_URL
} = require('../../config/init.config');

const {
  client_id,
  client_secret
} = require('../../config/auth.config');

function retryHttpRequest(promiseCreator, retries, delay, delayMultiplier) {
    return new Promise((resolve, reject) => {
      promiseCreator()
        .then(resolve)
        .catch((err) => {
          if (retries == 0) {
            reject(err);
          } else {
            let retryFunc = function() {
              retries--;
              delay = delay * delayMultiplier;
              resolve(retryHttpRequest(promiseCreator, retries, delay, delayMultiplier));
            }
            setTimeout(retryFunc, delay);
          }
        });
      });
}

function httpGetPromise(url, access_token) {
  const options = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        let httpError = {
          errorUrl: 'GET - Error contacting ' + url + ': ' + error,
          errorBody: JSON.stringify(body)
        }
        reject(httpError);
      }
    })
  });
}

function httpPostRefreshTokenPromise(refresh_token) {
  return new Promise((resolve, reject) => {
    let url = OAUTH_TOKEN_URL;
    request.post(url, {
      form: {
        client_id: client_id,
        client_secret: client_secret,
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      }
    }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        resolve(body)
      } else {
        let httpError = {
          errorUrl: 'POST - Error contacting ' + url + ': ' + error,
          errorBody: JSON.stringify(body)
        }
        reject(httpErr);
      }
    });
  });
}

exports.httpGetRequest = function(url, access_token) {
  let retries = GAPI_MAX_RETRIES;
  let delay = GAPI_INIT_RETRY_DELAY;
  let delayMultiplier = GAPI_DELAY_MULTIPLIER;
  let promiseCreator = () => httpGetPromise(url, access_token);

  return retryHttpRequest(promiseCreator, retries, delay, delayMultiplier);
}

exports.httpRefreshTokenRequest = function(refresh_token) {
  let retries = GAPI_MAX_RETRIES;
  let delay = GAPI_INIT_RETRY_DELAY;
  let delayMultiplier = GAPI_DELAY_MULTIPLIER;
  let promiseCreator = () => httpPostRefreshTokenPromise(refresh_token);

  return retryHttpRequest(promiseCreator, retries, delay, delayMultiplier);
}

exports.asyncForEach = async function(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
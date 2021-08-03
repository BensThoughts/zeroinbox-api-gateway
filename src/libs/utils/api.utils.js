// const logger = require('../loggers/log4js');
const request = require('request');

const {
  GAPI_DELAY_MULTIPLIER,
  GAPI_MAX_RETRIES,
  GAPI_INIT_RETRY_DELAY,
  OAUTH_TOKEN_URL,
} = require('../../config/init.config');

const {
  CLIENT_ID,
  CLIENT_SECRET,
} = require('../../config/auth.config');

/**
 * @param  {Function} promiseCreator
 * @param  {number} retries
 * @param  {number} delay
 * @param  {number} delayMultiplier
 * @return {Promise}
 */
function retryHttpRequest(promiseCreator, retries, delay, delayMultiplier) {
  return new Promise((resolve, reject) => {
    promiseCreator()
        .then(resolve)
        .catch((err) => {
          if (retries == 0) {
            reject(err);
          } else {
            const retryFunc = function() {
              retries--;
              delay = delay * delayMultiplier;
              resolve(
                  retryHttpRequest(
                      promiseCreator,
                      retries,
                      delay,
                      delayMultiplier,
                  ),
              );
            };
            setTimeout(retryFunc, delay);
          }
        });
  });
}

/**
 * @param  {string} url
 * @param  {string} accessToken
 * @return {Promise}
 */
function httpGetPromise(url, accessToken) {
  const options = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    },
  };
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        const httpError = {
          errorUrl: 'GET - Error contacting ' + url + ': ' + error,
          errorBody: JSON.stringify(body),
        };
        reject(httpError);
      }
    });
  });
}

/**
 * @param  {string} refreshToken
 * @return {Promise}
 */
function httpPostRefreshTokenPromise(refreshToken) {
  return new Promise((resolve, reject) => {
    const url = OAUTH_TOKEN_URL;
    request.post(url, {
      form: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
    }, (error, res, body) => {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        const httpError = {
          errorUrl: 'POST - Error contacting ' + url + ': ' + error,
          errorBody: JSON.stringify(body),
        };
        reject(httpError);
      }
    });
  });
}

exports.httpGetRequest = function(url, accessToken) {
  const retries = GAPI_MAX_RETRIES;
  const delay = GAPI_INIT_RETRY_DELAY;
  const delayMultiplier = GAPI_DELAY_MULTIPLIER;
  const promiseCreator = () => httpGetPromise(url, accessToken);

  return retryHttpRequest(promiseCreator, retries, delay, delayMultiplier);
};

exports.httpRefreshTokenRequest = function(refreshToken) {
  const retries = GAPI_MAX_RETRIES;
  const delay = GAPI_INIT_RETRY_DELAY;
  const delayMultiplier = GAPI_DELAY_MULTIPLIER;
  const promiseCreator = () => httpPostRefreshTokenPromise(refreshToken);

  return retryHttpRequest(promiseCreator, retries, delay, delayMultiplier);
};

exports.asyncForEach = async function(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const logger = require('../loggers/log4js');
const request = require('request');

const {
  GAPI_DELAY_MULTIPLIER,
  GAPI_MAX_RETRIES,
  GAPI_INIT_RETRY_DELAY
} = require('../../config/init.config');

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

function httpPromise(url, access_token) {
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
        logger.error('Error contacting ' + url + ': ' + JSON.stringify(error));
        reject(error);
      }
    })
  });
}

exports.httpRequest = function(url, access_token) {
  let retries = GAPI_MAX_RETRIES;
  let delay = GAPI_INIT_RETRY_DELAY;
  let delayMultiplier = GAPI_DELAY_MULTIPLIER;
  let promiseCreator = () => httpPromise(url, access_token);

  return retryHttpRequest(promiseCreator, retries, delay, delayMultiplier);
}

exports.asyncForEach = async function(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
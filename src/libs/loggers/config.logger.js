const logger = require('./log4js');

const initEnvVars = require('../../config/init.config');
const authEnvVars = require('../../config/auth.config');

/**
 * Logs the config given by env vars
 */
function logConfig() {
  // init env vars
  Object.keys(initEnvVars).forEach((envVar) => {
    logger.info(envVar + ': ' + initEnvVars[envVar]);
  });
  // authentication env vars
  Object.keys(authEnvVars).forEach((envVar) => {
    logger.info(envVar + ': ' + authEnvVars[envVar]);
  });
}

module.exports = {
  logConfig,
};

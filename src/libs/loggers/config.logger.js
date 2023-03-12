const logger = require('./log4js');

const initEnvVars = require('../../config/init.config');
const authEnvVars = require('../../config/auth.config');
const {
  rabbitTopJSON,
  RABBIT_URL,
  RABBIT_CONNECTION,
} = require('../../config/rabbit.config');

/**
 * Logs the config given by env vars
 */
function logConfig() {
  // Microservice Name
  logger.info('');
  logger.info('--------------------------------------------------------------');
  logger.info('++                                                          ++');
  logger.info('++                 ZeroInbox Api-Gateway                    ++');
  logger.info('++                                                          ++');
  logger.info('--------------------------------------------------------------');

  // init env vars
  logger.info('');
  logger.info('******** INIT ENV VARS ********');
  Object.keys(initEnvVars).forEach((envVar) => {
    logger.info(envVar + ': ' + initEnvVars[envVar]);
  });
  // authentication env vars
  logger.info('');
  logger.info('******** AUTH ENV VARS ********');
  Object.keys(authEnvVars).forEach((envVar) => {
    logger.info(envVar + ': ' + authEnvVars[envVar]);
  });

  logger.info('');
  logger.info('******** RABBIT CONNECTION ********');
  if (RABBIT_URL) {
    logger.info('RABBIT_URL: ' + RABBIT_URL);
  } else if (RABBIT_CONNECTION) {
    Object.keys(RABBIT_CONNECTION).forEach((key) => {
      logger.info(key + ': ' + RABBIT_CONNECTION[key]);
    });
  }
  logger.info('Rabbit Topology: ' + rabbitTopJSON.toString());

  logger.info('');
}

module.exports = {
  logConfig,
};

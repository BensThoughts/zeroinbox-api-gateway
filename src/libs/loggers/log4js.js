const log4js = require('log4js');

log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%[[%d] [%p] [ZeroInbox-Api-Gateway] -%] %X{userId}%m',
      },
    },
    stderr: {
      type: 'stderr',
      layout: {
        type: 'pattern',
        pattern: '%[[%d] [%p] [ZeroInbox-Api-Gateway] -%] %X{userId}%m',
      },
    },
  },

  categories: {
    default: {
      appenders: ['stdout'],
      level: 'trace',
    },
  },
});

// const {LOG_LEVEL} = require('../../config/init.config');

const logger = log4js.getLogger();
logger.addContext('userId', '');

module.exports = logger;

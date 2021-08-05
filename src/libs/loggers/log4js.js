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
    debug: {
      type: 'file',
      filename: './logs/debug.log',
      maxLogSize: 5485760,
      backups: 5,
      compress: true,
    },
    error: {
      type: 'file',
      filename: './logs/error.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
    info: {
      type: 'file',
      filename: './logs/info.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },

    /** log file write filters **/
    _info: {
      type: 'logLevelFilter',
      appender: 'info',
      level: 'info',
      maxLevel: 'info',
    },
    _error: {
      type: 'logLevelFilter',
      appender: 'error',
      level: 'warn',
      maxLevel: 'fatal',
    },
    _trace: {
      type: 'logLevelFilter',
      appender: 'debug',
      level: 'trace',
    },


    /** stdout and stderr write filters */
    /** Dev Setting */
    _stdout_debug: {
      type: 'logLevelFilter',
      appender: 'stdout',
      level: 'debug',
      maxLevel: 'info',
    },
    _stdout_trace: {
      type: 'logLevelFilter',
      appender: 'stdout',
      level: 'trace',
      maxLevel: 'info',
    },

    /** Dev Setting */
    _stderr_debug: {
      type: 'logLevelFilter',
      appender: 'stderr',
      level: 'warn',
      maxLevel: 'fatal',
    },

    /** Prod Setting */
    _stderr_prod: {
      type: 'logLevelFilter',
      appender: 'stderr',
      level: 'warn',
      maxLevel: 'fatal',
    },
    _stdout_prod: {
      type: 'logLevelFilter',
      appender: 'stdout',
      level: 'info',
      maxLevel: 'info',
    },

  },

  categories: {
    default: {
      appenders: ['_stdout_prod'],
      level: 'info',
    },

    dev: {
      appenders: [
        '_info',
        '_stdout_debug',
        '_error',
        '_stderr_debug',
        '_trace',
      ],
      level: 'trace',
    },

    dev_trace: {
      appenders: [
        '_info',
        '_stdout_trace',
        '_error',
        '_stderr_debug',
        '_trace',
      ],
      level: 'trace',
    },

    production_trace: {
      appenders: [
        '_stdout_trace',
        '_stderr_debug',
      ],
      level: 'trace',
    },

    production_debug: {
      appenders: [
        '_stdout_trace',
        '_stderr_debug',
      ],
      level: 'trace',
    },

    production: {
      appenders: [
        '_stdout_prod',
        '_stderr_prod',
      ],
      level: 'info',
    },
  },
});

const {LOG_LEVEL} = require('../../config/init.config');

const logger = log4js.getLogger(LOG_LEVEL);
logger.addContext('userId', '');

module.exports = logger;

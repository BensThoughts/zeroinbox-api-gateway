const logger = require('../../loggers/log4js');

exports.healthz = function(req, res, next) {
  logger.trace('trace');
  logger.debug('Health Check Headers: ' + JSON.stringify(req.headers));
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');
  
  if (req.headers['health-check'] === 'true') {
    res.status(200).send();
  } else {
    next();
  }
}
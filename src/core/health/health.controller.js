const logger = require('../../libs/loggers/log4js');

exports.healthz = function(req, res, next) {
  logger.debug('Health Check Headers: ' + JSON.stringify(req.headers));
  if (req.headers['health-check'] === 'true') {
    res.status(200).send();
  } else {
    next();
  }
}
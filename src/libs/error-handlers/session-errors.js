const logger = require('../loggers/log4js');

function sessionErrors(req, res, next) {
  if (!req.session) {
    logger.error('No session set, is redis up? or attacker?!');
    logger.error('No session set cookie: ' + req.cookie);
    res.status(403).json({
      status: 'error',
      status_message: 'No session found, was cookie set correctly?!'
    });
  } else {
    next();
  }
}

module.exports = sessionErrors;
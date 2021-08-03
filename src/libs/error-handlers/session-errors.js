const logger = require('../loggers/log4js');

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 */
function sessionErrors(req, res, next) {
  if (!req.session) {
    logger.error('No session set, is redis up? or attacker?!');
    logger.error('Cookie attached to req with no session set: ' + req.cookie);
    res.status(403).json({
      status: 'error',
      status_message: 'No session found, was cookie set correctly?!',
    });
  } else {
    next();
  }
}

module.exports = sessionErrors;

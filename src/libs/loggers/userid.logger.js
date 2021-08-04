const logger = require('../loggers/log4js');

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * //@return {Function}
 */
function userIdLogger(req, res, next) {
  try {
    // const path = req.path;
    const userId = req.session.userInfo.userId;
    logger.addContext('userId', userId + ' - ');
    next();
  } catch (e) {
    next();
  }
}

module.exports = userIdLogger;

// const logger = require('../loggers/log4js');

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * @return {Function}
 */
function authErrors(req, res, next) {
  const path = req.path;
  switch (path) {
    case '/v1/oauth2init':
      return next();
    case '/v1/oauth2callback':
      return next();
    default:
      return checkAuth(req, res, next);
  }
}

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * @return {Function}
 */
function checkAuth(req, res, next) {
  if (!req.session.token) {
    return res.status(401).json({
      status: 'error',
      status_message: 'No credentials set!',
    });
  }
  return next();
}

module.exports = authErrors;

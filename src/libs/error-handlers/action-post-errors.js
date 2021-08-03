// const logger = require('../loggers/log4js');

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {Function} next
 * @return {Function}
 */
function actionPostErrors(req, res, next) {
  const path = req.path;
  const method = req.method;
  if (path === '/v1/actions' && method === 'POST') {
    return checkPostBody(req, res, next);
  } else {
    return next();
  }
}

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {Function} next
 * @return {Function}
 */
function checkPostBody(req, res, next) {
  const body = req.body;
  const bodyCheck = checkBody(body);
  if (bodyCheck.error) {
    return res.status(400).json({
      status: 'error',
      status_message: bodyCheck.error_message,
    });
  } else {
    return next();
  }
}

/**
 * TODO: Implement later
 * @param  {ExpressJS} body
 * @return {boolean}
 */
function checkBody(body) {
  return {
    error: false,
  };
}

module.exports = actionPostErrors;

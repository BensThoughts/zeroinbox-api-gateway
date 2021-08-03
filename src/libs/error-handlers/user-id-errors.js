/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * @return {Function}
 */
function userIdErrors(req, res, next) {
  const path = req.path;
  switch (path) {
    case '/v1/oauth2init':
      return next();
    case '/v1/oauth2callback':
      return next();
    case '/v1/basicProfile':
      return next();
    default:
      checkUserId(req, res, next);
  }
}

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * @return {Function}
 */
function checkUserId(req, res, next) {
  if (!req.session.userInfo) {
    return res.status(400).json({
      status: 'error',
      status_message: 'Must call /v1/basicProfile before calling ' +
                      req.route + '!',
    });
  } else if (!req.session.userInfo.userId) {
    return res.status(400).json({
      status: 'error',
      status_message: 'Must call /v1/basicProfile before calling ' +
                      req.route + '!',
    });
  } else {
    return next();
  }
}

module.exports = userIdErrors;


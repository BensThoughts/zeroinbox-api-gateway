/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * @return {Function}
 */
function emailIdErrors(req, res, next) {
  const path = req.path;
  switch (path) {
    case '/v1/oauth2init':
      return next();
    case '/v1/oauth2callback':
      return next();
    case '/v1/basicProfile':
      return next();
    case '/v1/emailProfile':
      return next();
    default:
      return checkEmailId(req, res, next);
  }
}

/**
 * @param  {ExpressJS} req
 * @param  {ExpressJS} res
 * @param  {ExpressJS} next
 * @return {Function}
 */
function checkEmailId(req, res, next) {
  if (!req.session.userInfo) {
    return res.status(400).json({
      status: 'error',
      status_message: 'Must call /v1/basicProfile, followed by ' +
                      '/v1/emailProfile, before calling ' + req.route + '!',
    });
  } else if (!req.session.userInfo.emailId) {
    return res.status(400).json({
      status: 'error',
      status_message: 'Must call /v1/basicProfile, followed by ' +
                      '/v1/emailProfile, before calling ' + req.route + '!',
    });
  } else {
    return next();
  }
}

module.exports = emailIdErrors;

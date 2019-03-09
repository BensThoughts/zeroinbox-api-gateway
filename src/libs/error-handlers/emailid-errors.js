function emailIdErrors(req, res, next) {
    let path = req.path;
    switch(path) {
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

function checkEmailId(req, res, next) {
    if (!req.session.user_info.emailId) {
      return res.status(400).json({
        status: 'error',
        status_message: 'Must call /v1/basicProfile, followed by /v1/emailProfile, before calling ' + req.route + '!'
      })
    } else {
      return next();
    }
}

module.exports = emailIdErrors;
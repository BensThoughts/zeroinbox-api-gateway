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
      case '/v1/firstRunStatus':
        return checkEmailId(req, res, next);
      case '/v1/loadSuggestions':
        return checkEmailId(req, res, next);
      case '/v1/loadingStatus':
        return checkEmailId(req, res, next);
      case '/v1/suggestions':
        return checkEmailId(req, res, next);
      case '/v1/senders':
        return checkEmailId(req, res, next);
      // case '/v1/stats':
        // return next();
      case '/v1/actions':
        return checkEmailId(req, res, next);
      default:
        return checkEmailId(req, res, next);
        // return checkAuth(req, res, next);
    }
}

function checkEmailId(req, res, next) {
    if (!req.session.user_info.emailId) {
      return res.status(400).json({
        status: 'error',
        status_message: 'Must call /v1/basicProfile, followed by /v1/emailProfile, before calling ' + req.route + '!'
      })
    } else {
      return checkAuth(req, res, next);
    }
}

module.exports = emailIdErrors;
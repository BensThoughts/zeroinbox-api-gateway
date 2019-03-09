function userIdErrors(req, res, next) {
    let path = req.path;
    switch(path) {
      case '/v1/oauth2init':
        return next();
      case '/v1/oauth2callback':
        return next();
      case '/v1/basicProfile':
        return next();
      case '/v1/emailProfile':
        return checkUserId(req, res, next);
      case '/v1/firstRunStatus':
        return checkUserId(req, res, next);
      case '/v1/loadSuggestions':
        return checkUserId(req, res, next);
      case '/v1/loadingStatus':
        return checkUserId(req, res, next);
      case '/v1/suggestions':
        return checkUserId(req, res, next);
      case '/v1/senders':
        return checkUserId(req, res, next);
      // case '/v1/stats':
        // return next();
      case '/v1/actions':
        return checkUserId(req, res, next);
      default:
        // return checkAuth(req, res, next);
    }
}

function checkUserId(req, res, next) {
    if (!req.session.user_info) {
      return res.status(400).json({
        status: 'error',
        status_message: 'Must call /v1/basicProfile before calling ' + req.route + '!'
      });
    } else if (!req.session.user_info.userId) {
      return res.status(400).json({
        status: 'error',
        status_message: 'Must call /v1/basicProfile before calling ' + req.route + '!'
      });
    } else {
      switch (req.path) {
        case '/v1/emailProfile':
          return checkAuth(req, res, next);
        default:
          return checkEmailId(req, res, next);
      }
    }
}

module.exports = userIdErrors;


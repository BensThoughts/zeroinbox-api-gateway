const logger = require('../loggers/log4js');

function authErrors(req, res, next) {
    let path = req.path;
    switch(path) {
      case '/v1/oauth2init':
        return next();
      case '/v1/oauth2callback':
        return next();
      case '/v1/basicProfile':
        return checkAuth(req, res, next);
      case '/v1/emailProfile':
        return checkAuth(req, res, next);
      case '/v1/firstRunStatus':
        return checkAuth(req, res, next);
      case '/v1/loadSuggestions':
        return checkAuth(req, res, next);
      case '/v1/loadingStatus':
        return checkAuth(req, res, next);
      case '/v1/suggestions':
        return checkAuth(req, res, next);
      case '/v1/senders':
        return checkAuth(req, res, next);
      // case '/v1/stats':
        // return next();
      case '/v1/actions':
        return checkAuth(req, res, next);
      default:
        return checkAuth(req, res, next);
    }
}

function checkAuth(req, res, next) {
    if (!req.session.token) {
        return res.status(401).json({
          status: 'error',
          status_message: 'No credentials set!'
        });
    }
    return next();
}

module.exports = authErrors;
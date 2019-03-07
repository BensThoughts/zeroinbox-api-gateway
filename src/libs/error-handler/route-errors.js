const logger = require('../loggers/log4js');

function routeErrors(req, res, next) {
  if (!req.session) {
    logger.debug('No session set, is redis up? or attacker?!');
    res.status(403).json({
      status: 'error',
      status_message: 'No session found, was cookie set correctly?!'
    });
  } else {
    let path = req.path;
    switch(path) {
      case '/v1/oauth2init':
        return next();
      case '/v1/oauth2callback':
        return next();
      case '/v1/basicProfile':
        return checkAuth(req, res, next);
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
      default:
        return checkAuth(req, res, next);
    }
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

function checkAuth(req, res, next) {
    if (!req.session.token) {
      return res.status(401).json({
        status: 'error',
        status_message: 'No credentials set!'
      });
    }
    return next();
}

module.exports = routeErrors;
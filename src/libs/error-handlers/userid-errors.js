function userIdErrors(req, res, next) {
    let path = req.path;
    switch(path) {
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
        return next();
    }
}

module.exports = userIdErrors;


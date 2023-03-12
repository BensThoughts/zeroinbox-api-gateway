// const logger = require('../../libs/loggers/log4js');

exports.healthCheck = function(req, res, next) {
  if (req.headers['health-check'] === 'true') {
    res.status(200).send();
  } else {
    next();
  }
};

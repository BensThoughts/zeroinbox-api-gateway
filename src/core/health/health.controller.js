const logger = require('../../loggers/log4js');

exports.healthz = function(req, res) {
    res.status(200).send();
}
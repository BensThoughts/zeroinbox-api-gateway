const logger = require('../../loggers/log4js');

exports.healthz = function(req, res) {
    logger.debug('Health Checked!')
    res.status(200).send();
}
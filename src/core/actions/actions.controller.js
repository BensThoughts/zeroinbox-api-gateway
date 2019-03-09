const logger = require('../../libs/loggers/log4js');
const { publishActions } = require('../../libs/utils/rabbit.utils');

exports.postActions = function(req, res) {
    let userId = req.session.user_info.userId;
    let body = req.body;
    logger.trace(body);
    logger.trace(userId);
    let bodyCheck = checkBody(body);
    if (bodyCheck.error) {
        res.status(400).json({
            status: 'error',
            status_message: bodyCheck.error_message
        });
    } else {
  
        publishActions(userId, body);
        res.status(200).json({
            status: 'success',
            status_message: 'OK',
        });
    }
}

exports.getActions = function(req, res) {
    let userId = req.session.user_info.userId

}


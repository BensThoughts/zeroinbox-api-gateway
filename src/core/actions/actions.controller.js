const logger = require('../../libs/loggers/log4js');
const { publishActions } = require('../../libs/utils/rabbit.utils');

exports.postActions = function(req, res) {
    let userId = req.session.user_info.userId;
    let body = req.body;
    logger.trace(body);
    logger.trace(userId);
    res.status(200).json({
        status: 'success',
        status_message: 'OK'
    });
}

exports.getActions = function(req, res) {
    let userId = req.session.user_info.userId

}


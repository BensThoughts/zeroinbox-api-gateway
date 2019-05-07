const logger = require('../../libs/loggers/log4js');
const { publishActions } = require('../../libs/utils/rabbit.utils');

exports.postActions = function(req, res) {
    let userId = req.session.user_info.userId;
    let access_token = req.session.token.access_token
    let body = req.body;
    let actionType = body.actionType;
    let senderIds = body.senderIds;
    logger.trace(body);
    logger.trace(userId);
    publishActions(userId, access_token, senderIds, actionType, false, '');
    res.status(200).json({
        status: 'success',
        status_message: 'OK'
    });
}


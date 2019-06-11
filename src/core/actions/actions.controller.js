const logger = require('../../libs/loggers/log4js');
const { publishActions } = require('../../libs/utils/rabbit.utils');


/**
 * actionsObj - {
 *  senderId: string,
 *  actionType: string,
 *  filter: boolean,
 *  labelName: string,
 *  category: string
 * }
 */

exports.postActions = function(req, res) {
    let userId = req.session.user_info.userId;
    let access_token = req.session.token.access_token
    let body = req.body;
    let senderIds = body.senderIds;

    logger.trace(body);

    senderIds.forEach((senderId) => {
        let actionType = body.actionType;
        let filter = body.filter;
        let labelName = body.labelName;
        let category = body.category;
        let unsubscribeEmail = body.unsubscribeEmail;
        let unsubscribeWeb = body.unsubscribeWeb;

        let actionsObj = {
            senderId: senderId,
            actionType: actionType,
            filter: filter,
            category: category,
            labelName: labelName,
            unsubscribeEmail: unsubscribeEmail,
            unsubscribeWeb: unsubscribeWeb
        }
    
        publishActions(userId, access_token, actionsObj);
    });

    res.status(200).json({
        status: 'success',
        status_message: 'OK'
    });
}


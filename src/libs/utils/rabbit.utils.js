const rabbit = require('zero-rabbit');
const logger = require('../loggers/log4js');

exports.publishUser = function(userId, access_token) {
    let sentAt = new Date().getTime();
    rabbit.publish('api.send.1', 'user.ids.ex.1', '', {
      userId: userId,
      access_token: access_token,
    }, { 
      contentType: 'application/json', 
      type: 'user',
      appId: 'zi-api-gateway',
      timestamp: sentAt,
      encoding: 'string Buffer',
      persistent: true,
    });
}

/**
 * actionsObj - {
 *  senderIds: string,
 *  actionType: string,
 *  filter: boolean,
 *  labelName: string,
 *  category: string,
 * }
 */

exports.publishActions = function(userId, access_token, actionsObj) {
    let sentAt = new Date().getTime();
    let senderIds = actionsObj.senderIds;
    let actionType = actionsObj.actionType;
    let filter = actionsObj.filter;
    let labelName = actionsObj.labelName;
    let category = actionsObj.category;

    rabbit.publish('api.send.1', 'batch.actions.ex.1', '', {
        userId: userId,
        access_token: access_token,
        senderIds: senderIds,
        actionType: actionType,
        filter: filter,
        labelName: labelName,
        category: category
    }, {
        contentType: 'application/json',
        type: 'actions',
        appId: 'zi-api-gateway',
        timestamp: sentAt,
        encoding: 'string Buffer',
        persistent: true,
    });    
}
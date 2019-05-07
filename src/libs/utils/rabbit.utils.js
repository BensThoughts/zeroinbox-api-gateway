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

exports.publishActions = function(userId, access_token, senderId, actionType, filter, labelName) {
    let sentAt = new Date().getTime();
    rabbit.publish('api.send.1', 'batch.actions.ex.1', '', {
        userId: userId,
        access_token: access_token,
        senderId: senderId,
        actionType: actionType,
        filter: filter,
        labelName: labelName
    }, {
        contentType: 'application/json',
        type: 'actions',
        appId: 'zi-api-gateway',
        timestamp: sentAt,
        encoding: 'string Buffer',
        persistent: true,
    });    
}
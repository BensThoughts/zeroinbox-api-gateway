const rabbit = require('zero-rabbit');
const logger = require('../loggers/log4js');
const {
  rabbit_topology
} = require('../../config/rabbit.config');

exports.publishGetMessagesUserId = function (userId, access_token) {
  let sentAt = new Date().getTime();
  let getMessagesExchange = rabbit_topology.exchanges.fanout.getMessages;
  rabbit.publish(rabbit_topology.channels.send, getMessagesExchange, '', {
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

exports.publishGetThreadsUserId = function(userId, access_token) {
    let sentAt = new Date().getTime();
    let getThreadsExchange = rabbit_topology.exchanges.fanout.getThreads;
    rabbit.publish(rabbit_topology.channels.send, getThreadsExchange, '', {
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
 *  senderId: string,
 *  actionType: string,
 *  filter: boolean,
 *  labelName: string,
 *  category: string,
 *  unsubscribeWeb: string,
 *  unsubscribeEmail: string
 * }
 */
exports.publishActions = function(userId, access_token, actionsObj, senderIds) {

  for (i = 0; i < senderIds.length; i++) {
    let senderId = senderIds[i];
    let sentAt = new Date().getTime();
    let actionType = actionsObj.actionType;
    let filter = actionsObj.filter;
    let labelName = actionsObj.labelName;
    let category = actionsObj.category;
    let unsubscribeEmail = actionsObj.unsubscribeEmail;
    let unsubscribeWeb = actionsObj.unsubscribeWeb;

    rabbit.publish('api.send.1', 'actions.direct.ex.1', '', {
        userId: userId,
        access_token: access_token,
        senderId: senderId,
        actionType: actionType,
        filter: filter,
        labelName: labelName,
        category: category,
        unsubscribeEmail: unsubscribeEmail,
        unsubscribeWeb: unsubscribeWeb,
    }, {
        contentType: 'application/json',
        type: 'actions',
        appId: 'zi-api-gateway',
        timestamp: sentAt,
        encoding: 'string Buffer',
        persistent: true,
    });
  } 
}
// const logger = require('../loggers/log4js');
const rabbit = require('zero-rabbit');
const {
  userTopology,
} = require('../../config/rabbit.config');

exports.publishGetMessagesUserId = function(userId, accessToken) {
  const sentAt = new Date().getTime();
  const getMessagesExchange = userTopology.exchanges.fanout.getMessages;
  rabbit.publish(userTopology.channels.send, getMessagesExchange, '', {
    userId: userId,
    accessToken: accessToken,
  }, {
    contentType: 'application/json',
    type: 'user',
    appId: 'zi-api-gateway',
    timestamp: sentAt,
    encoding: 'string Buffer',
    persistent: true,
  });
};

exports.publishGetThreadsUserId = function(userId, accessToken) {
  const sentAt = new Date().getTime();
  const getThreadsExchange = userTopology.exchanges.fanout.getThreads;
  rabbit.publish(userTopology.channels.send, getThreadsExchange, '', {
    userId: userId,
    accessToken: accessToken,
  }, {
    contentType: 'application/json',
    type: 'user',
    appId: 'zi-api-gateway',
    timestamp: sentAt,
    encoding: 'string Buffer',
    persistent: true,
  });
};

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

exports.publishActions = function(userId, accessToken, actionsObj, senderIds) {
  for (i = 0; i < senderIds.length; i++) {
    const senderId = senderIds[i];
    const sentAt = new Date().getTime();
    const actionType = actionsObj.actionType;
    const filter = actionsObj.filter;
    const labelName = actionsObj.labelName;
    const category = actionsObj.category;
    const unsubscribeEmail = actionsObj.unsubscribeEmail;
    const unsubscribeWeb = actionsObj.unsubscribeWeb;

    const actionsExchange = userTopology.exchanges.direct.actions;
    rabbit.publish(userTopology.channels.send, actionsExchange, '', {
      userId: userId,
      accessToken: accessToken,
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
};

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


function publishActionsUserId(userId) {
  let sentAt = new Date().getTime();
  rabbit.publish('api.send.1', 'actions.userIds.ex.1', '', {
    userId: userId
  },
  {
  contentType: 'application/json',
  type: 'actions',
  appId: 'zi-api-gateway',
  timestamp: sentAt,
  encoding: 'string Buffer',
  persistent: true
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

/*     let lastMsg = false;
    if (i === (senderIds.length -1)) {
      lastMsg = true;
    } */

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
        // lastMsg: lastMsg,
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
  /*   rabbit.assertQueue('api.send.1', 'actions.userId.' + userId, { autoDelete: false, durable: true }, (assertQueueErr, q) => {
      if (assertQueueErr) {
        return logger.error(assertQueueErr);
      } else {
        rabbit.bindQueue('api.send.1', 'actions.userId.' + userId, 'actions.topic.ex.1', 'userId.' + userId, {}, (bindQueueErr, ok) => {
          if (bindQueueErr) {
            return logger.error(bindQueueErr);
          } else {
            for (i = 0; i < senderIds.length; i++) {
              let senderId = senderIds[i];
              let sentAt = new Date().getTime();
              let actionType = actionsObj.actionType;
              let filter = actionsObj.filter;
              let labelName = actionsObj.labelName;
              let category = actionsObj.category;
              let unsubscribeEmail = actionsObj.unsubscribeEmail;
              let unsubscribeWeb = actionsObj.unsubscribeWeb;

              let lastMsg = false;
              if (i === (senderIds.length -1)) {
                lastMsg = true;
              }
          
              rabbit.publish('api.send.1', 'actions.topic.ex.1', 'userId.' + userId, {
                  userId: userId,
                  access_token: access_token,
                  senderId: senderId,
                  actionType: actionType,
                  filter: filter,
                  labelName: labelName,
                  category: category,
                  unsubscribeEmail: unsubscribeEmail,
                  unsubscribeWeb: unsubscribeWeb,
                  lastMsg: lastMsg,
              }, {
                  contentType: 'application/json',
                  type: 'actions',
                  appId: 'zi-api-gateway',
                  timestamp: sentAt,
                  encoding: 'string Buffer',
                  persistent: true,
              });
              publishActionsUserId(userId);
   
            } 
          }
        });
      }
    }); */
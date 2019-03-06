const rabbit = require('zero-rabbit');
const logger = require('../loggers/log4js');

function publishUser(userId, access_token) {
    let sentAt = new Date().getTime();
    logger.debug(sentAt);
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

module.exports = {
    publishUser
}
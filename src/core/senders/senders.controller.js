const logger = require('../../libs/loggers/log4js');
const {
  findSenders,
} = require('../../libs/utils/mongoose.utils');

exports.senders = function(req, res) {
  const userId = req.session.userInfo.userId;
  findSenders(userId, (err, senders) => {
    if (err) {
      logger.error(userId + ' - Error in suggestion.find(): ' + err);
      res.json({
        status: 'error',
        status_message: 'Error at /senders: Error in MongoDb find',
      });
    } else {
      sendersProjection = senders.map((sender) => {
        return {
          senderAddress: sender.senderAddress,
          senderNames: sender.senderNames,
          totalSizeEstimate: sender.totalSizeEstimate,
          unsubscribeEmail: sender.unsubscribeEmail,
          unsubscribeWeb: sender.unsubscribeWeb,
          unsubscribed: sender.unsubscribed,
          senderId: sender.senderId,
          threadIdCount: sender.threadIds.length,
          messageIdCount: sender.messageIds.length,
        };
      });

      res.json({
        status: 'success',
        status_message: 'OK',
        data: {
          senders: sendersProjection,
        },
      });
    }
  });
};

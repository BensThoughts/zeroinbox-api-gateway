const logger = require('../../libs/loggers/log4js');

const { 
  // findSenderIds,
  // findSender,
  findSuggestions,
} = require('../../libs/utils/mongoose.utils');

const {
  asyncForEach
} = require('../../libs/utils/api.utils');

exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

  findSuggestions(userId, (err, senderIds) => {
    if (err) {
      logger.error('Error in suggestion.find(): ' + err);
      res.json({
        status: 'error',
        status_message: 'Error at /suggestions: Error in MongoDb find'
      });
    } else {
      res.json({ 
        status: 'success',
        status_message: 'OK',
        data: {
          suggestions: {
            senderIds: senderIds
          }
        }
      });
    }
  });
}

/* function findSuggestions(userId, callback) {
  let suggestions = [];
  findSenderIds(userId, async (findIdsErr, senderIds) => {
    if (findIdsErr) {
      logger.error('Error in findSuggestions() at findSenderIds(): ' + findIdsErr);
      callback(findIdsErr, undefined);
    }
    await asyncForEach(senderIds, async (senderId) => {
      await findSender(userId, senderId)
      .then((sender) => {
        suggestions.push(sender[0]);
      }).catch((err) => {
        logger.error('Error in findSuggestions() at findSender(): ' + err);
      });
    });
    callback(undefined, suggestions);    
  });
} */

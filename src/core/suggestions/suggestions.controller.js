const logger = require('../../libs/loggers/log4js');

const Suggestion = require('../models/suggestion.model');

exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

    let conditions = { userId: userId };

    let projection = {
      "senderAddress": 1,
      "senderNames": 1,
      "totalSizeEstimate": 1,
      "senderId": 1,
      "count": 1,
      _id: 0
    }

    Suggestion.find(conditions, projection, (err, raw) => {
      if (err) {
        logger.error('Error in suggestion.find(): ' + err);
        res.json({
          status: 'error',
          status_message: 'Error at /suggestions: Error in MongoDb find'
        });
      } else {
        let suggestions = raw;
        res.json({ 
          status: 'success',
          status_message: 'OK',
          data: {
            suggestions: suggestions 
          }
        });
      }
    });

}

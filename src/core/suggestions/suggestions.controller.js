const logger = require('../../loggers/log4js');

const Suggestion = require('../models/suggestion.model');

exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

    let conditions = { userId: userId };

    let projection = {
      // sender: 1,
      "senderAddress": 1,
      "senderNames": 1,
      "totalSizeEstimate": 1,
      "senderId": 1,
      "count": 1,
      _id: 0
    }

    Suggestion.find(conditions, projection, (err, raw) => {
      if (err) {
        res.json({
          status: 'error',
          status_message: 'Error in suggestion.find()'
        })
        return logger.error('Error in suggestion.find(): ' + err);
      };
      let suggestions = raw;
      res.json({ 
        status: 'success',
        status_message: 'OK',
        data: {
          suggestions: suggestions 
        }
      });
    })

}

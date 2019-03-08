const logger = require('../../libs/loggers/log4js');

const { findSuggestion } = require('../../libs/utils/mongoose.utils');

exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

  findSuggestion(userId, (err, raw) => {
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

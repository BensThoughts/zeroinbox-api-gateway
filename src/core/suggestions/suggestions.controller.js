const logger = require('../../libs/loggers/log4js');

const { 
  findSuggestions,
} = require('../../libs/utils/mongoose.utils');


exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

  findSuggestions(userId, (err, suggestions) => {
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
          suggestions: suggestions
        }
      });
    }
  });
}

exports.postSuggestions = function(req, res) {
  console.log(req.body);
  res.status(200).json({
    status: 'success',
    status_message: 'OK'
  });
}


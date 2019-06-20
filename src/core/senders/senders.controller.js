const logger = require('../../libs/loggers/log4js');
const {
    findSenders
} = require('../../libs/utils/mongoose.utils');

exports.senders = function(req, res) {
    let userId = req.session.user_info.userId;
    findSenders(userId, (err, senders) => {
        if (err) {
            logger.error('Error in suggestion.find(): ' + err);
            res.json({
              status: 'error',
              status_message: 'Error at /senders: Error in MongoDb find'
            });
          } else {
            res.json({ 
              status: 'success',
              status_message: 'OK',
              data: {
                senders: senders
              }
            });
          }
    });
}
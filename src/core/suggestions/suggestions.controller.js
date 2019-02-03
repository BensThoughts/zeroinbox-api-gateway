const Suggestion = require('../models/suggestion.model');

const chalk = require('chalk');

exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

    let conditions = { userId: userId };

    let projection = {
      sender: 1,
      "sender.fromAddress": 1,
      "sender.fromNames": 1,
      "sender.totalSizeEstimate": 1,
      "sender.id": 1,
      "sender.count": 1,
      _id: 0
    }

    Suggestion.find(conditions, projection, (err, raw) => {
      if (err) {
        res.json({
          status: 'error',
          status_message: 'Error in suggestion.find()'
        })
        return console.error('Error in suggestion.find(): ' + chalk.red(err))
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

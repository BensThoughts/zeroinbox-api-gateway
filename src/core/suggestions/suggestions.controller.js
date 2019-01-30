const Suggestion = require('../models/suggestion.model');

const mongoose = require('mongoose');

const configDB = require('../../config/database');

const chalk = require('chalk');

exports.suggestions = function (req, res) {
  let userId = req.session.user_info.userId;

  // mongoose.connect(configDB.url, {useNewUrlParser: true});

  // let db = mongoose.connection;

  // db.on('error', console.error.bind(console, 'connection error:'));

  // db.once('open', function() {

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
      if (err) return console.error(chalk.red(err));
      // console.log(raw);
      // console.log(raw);
      let suggestions = raw;
      res.json({ suggestions: suggestions });
    })

  // });

}

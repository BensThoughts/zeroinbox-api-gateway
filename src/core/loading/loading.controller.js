// const mongoose = require('mongoose');
const configDB = require('../../config/database');
// const mongodb = require('mongodb');
const mongoose = require('mongoose');
// const client = mongodb.MongoClient;


const History = require('../models/history.model');

/*******************************************************************************
 CHECK LOADING STATUS
*******************************************************************************/

exports.loading_status = function (req, res) {

  let userId = req.session.user_info.userId;

  mongoose.connect(configDB.url, {useNewUrlParser: true});

  let db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function() {

    let conditions = { userId: userId }

    History.findOne(conditions, (err, raw) => {
      if (err) return console.error(chalk.red(err));
      let loading = raw.active.loading;
      res.json({ loading_status: loading });
    });


  });

};

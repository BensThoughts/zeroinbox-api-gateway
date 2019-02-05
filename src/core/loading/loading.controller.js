/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const chalk = require('chalk');

const logger = require('../../logger/logger');

/*******************************************************************************
 INIT MONGOOSE
*******************************************************************************/
const History = require('../models/history.model');

/*******************************************************************************
 Check Loading Status
*******************************************************************************/

exports.loading_status = function (req, res) {

  logger.info(chalk.green('This is an info test'));
  let userId = req.session.user_info.userId;

    let conditions = { userId: userId }

    History.findOne(conditions, (err, raw) => {
      if (err) {
        logger.error('Error in history.findOne(): ' + err);
        res.json({
          status: 'error',
          status_message: 'Error in history.findOne()'
        })
        // return console.error()?
        // return console.error(chalk.red('Error in history.findOne(): ' + err));
      };
      let loading = raw.active.loadingStatus;
      res.json({ 
        status: 'success',
        status_message: 'OK',
        data: {
          loading_status: loading 
        }
      });
    });

};


exports.first_run_status = function(req, res, next) {
  // console.log('ping');
  let userId = req.session.user_info.userId;
  let conditions = { userId: userId }

  History.findOne(conditions, (err, doc) => {
    if (err) {
      res.json({
        status: 'error',
        status_message: 'Error in firstRunStatus at History.findOne()',
      });
    };
    // console.log(doc);
    if (doc.passive.firstRun === true) {
      let update = {
        'active.loadingStatus': true
      }
      let options = {
        multi: false,
        upsert: true
      }
      History.updateOne(conditions, update, options, (err, doc) => {
        res.json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: true
          }
        });
      })

    }
  });

};

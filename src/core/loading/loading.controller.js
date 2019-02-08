/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const logger = require('../../loggers/log4js');
const rabbit = require('../../helpers/rabbit.helper');

/*******************************************************************************
 INIT MONGOOSE
*******************************************************************************/
const History = require('../models/history.model');

/*******************************************************************************
 Check Loading Status
*******************************************************************************/

exports.loading_status = function (req, res) {

  let userId = req.session.user_info.userId;

    let conditions = { userId: userId }

    History.findOne(conditions, (err, raw) => {
      if (err) {
        logger.error('Error at loading_status in history.findOne(): ' + err);
        res.status(500).json({
          status: 'error',
          status_message: 'internal server error at path /loadingStatus'
        });
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
  let userId = req.session.user_info.userId;
  let access_token = req.session.token.access_token;

  let conditions = { userId: userId }

  History.findOne(conditions, (err, doc) => {
    if (err) {
      logger.error('Error at first_run_status in history.findOne(): ' + err);
      res.json({
        status: 'error',
        status_message: 'internal server error at path /firstRunStatus',
      });
    };
    // if (doc.passive.firstRun === true) {

      rabbit.publish('firstRun.ex.1', {
        userId: userId,
        access_token: access_token,
        firstRun: true
      });
      
      let update = {
        'active.loadingStatus': true
      }
      
      let options = {
        multi: false,
        upsert: true
      }
      History.updateOne(conditions, update, options, (err, doc) => {

        // update active.loadingStatus then tell client to start polling loadingStatus
        // by indicating firstRun
        res.json({
          status: 'success',
          status_message: 'OK',
          data: {
            firstRun: true
          }
        });
      });

    // } else {
    //  res.json({
    //    status: 'success',
    //    status_message: 'OK',
    //    data: {
    //      firstRun: false
    //    }
    //  })
    // }
  });

};

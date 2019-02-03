/*******************************************************************************
 INIT DEPS
*******************************************************************************/
const chalk = require('chalk');

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
        res.json({
          status: 'error',
          status_message: 'Error in history.findOne()'
        })
        // return console.error()?
        return console.error(chalk.red('Error in history.findOne(): ' + err));
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

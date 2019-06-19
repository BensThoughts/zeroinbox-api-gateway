const logger = require('../../libs/loggers/log4js');
const {
  findCategories,
  updateCategories
} = require('../../libs/utils/mongoose.utils');

exports.getCategories = function(req, res) {
  let userId = req.session.user_info.userId;
  findCategories(userId, (err, categories) => {
    logger.trace(categories);
    if (err) {
      logger.error(err);
      res.status(500).json({
        status: 'error',
        status_code: 500,
        status_message: 'Error finding categories'
      });
    } else {
      ok = checkCategories(categories);
      if (!ok) {
        categories = [
          { name: 'Friends', value: 'Friends' },
          { name: 'Shopping', value: 'Shopping' },
          { name: 'News', value: 'News' },
          { name: 'Work', value: 'Work' },
          { name: 'Finance', value: 'Finance' },
          { name: 'Travel', value: 'Travel' },
          { name: 'Misc', value: 'Misc' },
        ]
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'ok',
          data: {
            categories: categories
          }
        })
        updateCategories(userId, categories, (err, updateResponse) => {
          if (err) {
            logger.error(err);
          }
          logger.debug(updateResponse);
        });
      } else {
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'ok',
          data: {
            categories: categories
          }
        })
      }
    }
  });
}

function checkCategories(categories) {
  if (categories === null || categories === undefined) {
    return false;
  }
  return true;
}

exports.setCategories = function(req, res) {

}
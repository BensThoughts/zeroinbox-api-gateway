const logger = require('../../libs/loggers/log4js');
const {
  findCategories,
  addToCategories,
  removeCategory
} = require('../../libs/utils/mongoose.utils');

exports.getCategories = function(req, res) {
  let userId = req.session.user_info.userId;
  findCategories(userId, (err, categoriesResponse) => {
    if (err) {
      logger.error(err);
      res.status(500).json({
        status: 'error',
        status_code: 500,
        status_message: 'Error finding categories'
      });
    } else {
      ok = checkCategories(categoriesResponse);
      if (ok) {
        let categories = categoriesResponse.categories;
        logger.trace(userId + ' - Categories sent back' + JSON.stringify(categories));
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'ok',
          data: {
            categories: categories
          }
        })
      } else {
        let categories = [
          { name: 'Friends', value: 'Friends' },
          { name: 'Social', value: 'Social'},
          { name: 'Shopping', value: 'Shopping' },
          { name: 'News', value: 'News' },
          { name: 'Work', value: 'Work' },
          { name: 'Finance', value: 'Finance' },
          { name: 'Travel', value: 'Travel' },
          { name: 'Misc', value: 'Misc' },
        ];
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'ok',
          data: {
            categories: categories
          }
        })
        addToCategories(userId, categories, (err, updateResponse) => {
          if (err) return logger.error(userId + ' - ' + err);
          logger.trace(userId + ' - categories initialize to default');
        });
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
  let userId = req.session.user_info.userId;
  let body = req.body;
  logger.debug(body);
  let add = body.add;
  let category = body.category;
  if (add) {
    // let categories = [category];
    addToCategories(userId, category, (err, updateResponse) => {
      if (err) {
        logger.error(userId + ' - ' + err);
        res.status(500).json({
          status: 'error',
          status_code: 500,
          status_message: 'Error adding to categories'
        });
      } else {
        logger.trace(userId + ' - Category added: ' + category);
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'OK',
        })
      }
    });
  } else {
    removeCategory(userId, category, (err, updateResponse) => {
      if (err) {
        logger.error(userId + ' - ' + err);
        res.status(500).json({
          status: 'error',
          status_code: 500,
          status_message: 'Error adding to categories'
        });
      } else {
        logger.trace(userId + ' - Category removed: ' + category);
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'OK',
        })
      }
    });
  }

}
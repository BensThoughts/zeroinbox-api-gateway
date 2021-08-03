const logger = require('../../libs/loggers/log4js');
const {
  findCategories,
  addToCategories,
  removeCategory,
} = require('../../libs/utils/mongoose.utils');

exports.getCategories = function(req, res) {
  const userId = req.session.userInfo.userId;
  findCategories(userId, (err, categories) => {
    if (err) {
      logger.error(err);
      res.status(500).json({
        status: 'error',
        status_code: 500,
        status_message: 'Error finding categories',
      });
    } else {
      if (categories.length > 0) {
        logger.trace(userId +
          ' - Categories sent back' + JSON.stringify(categories));
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'ok',
          data: {
            categories: categories,
          },
        });
      } else {
        categories = categories.concat([
          {name: 'Friends', value: 'Friends'},
          {name: 'Social', value: 'Social'},
          {name: 'Shopping', value: 'Shopping'},
          {name: 'News', value: 'News'},
          {name: 'Work', value: 'Work'},
          {name: 'Finance', value: 'Finance'},
          {name: 'Travel', value: 'Travel'},
          {name: 'Misc', value: 'Misc'},
        ]);
        logger.trace(userId + ' - Categories created.');
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'ok',
          data: {
            categories: categories,
          },
        });
        addToCategories(userId, categories, (err, updateResponse) => {
          if (err) return logger.error(userId + ' - ' + err);
          logger.trace(userId + ' - categories initialize to default.');
        });
      }
    }
  });
};

exports.setCategories = function(req, res) {
  const userId = req.session.userInfo.userId;
  const body = req.body;
  logger.trace(userId +
    ' - POST - /v1/settings/categories: ' + JSON.stringify(body));
  const add = body.add;
  const category = body.category;
  if (add) {
    // let categories = [category];
    addToCategories(userId, category, (err, updateResponse) => {
      if (err) {
        logger.error(userId + ' - ' + err);
        res.status(500).json({
          status: 'error',
          status_code: 500,
          status_message: 'Error adding to categories',
        });
      } else {
        logger.trace(userId + ' - Category added: ' + JSON.stringify(category));
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'OK',
        });
      }
    });
  } else {
    removeCategory(userId, category, (err, updateResponse) => {
      if (err) {
        logger.error(userId + ' - ' + err);
        res.status(500).json({
          status: 'error',
          status_code: 500,
          status_message: 'Error adding to categories',
        });
      } else {
        logger.trace(userId +
          ' - Category removed: ' + JSON.stringify(category));
        res.status(200).json({
          status: 'success',
          status_code: 200,
          status_message: 'OK',
        });
      }
    });
  }
};

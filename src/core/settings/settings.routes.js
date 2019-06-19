var express = require('express');
var settingsRouter = express.Router();

var settingsController = require('./settings.controller');

// settingsRouter.get('/settings', userController.email_profile);

settingsRouter.get('/settings/categories', settingsController.getCategories);
settingsRouter.post('/settings/categories', settingsController.setCategories);


module.exports = settingsRouter;
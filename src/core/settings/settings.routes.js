const express = require('express');
const settingsController = require('./settings.controller');
// eslint-disable-next-line new-cap
const settingsRouter = express.Router();


settingsRouter.get('/settings/categories', settingsController.getCategories);
settingsRouter.post('/settings/categories', settingsController.setCategories);


module.exports = settingsRouter;

const express = require('express');
const settingsController = require('./settings.controller');

const settingsRouter = express.Router();


settingsRouter.get('/settings/categories', settingsController.getCategories);
settingsRouter.post('/settings/categories', settingsController.setCategories);


module.exports = settingsRouter;

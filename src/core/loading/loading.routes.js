var express = require('express');
var loadingRouter = express.Router();

var loadingController = require('./loading.controller');

loadingRouter.get('/loadingStatus', loadingController.loading_status);

loadingRouter.get('/loadSuggestions', loadingController.load_suggestions);

module.exports = loadingRouter;

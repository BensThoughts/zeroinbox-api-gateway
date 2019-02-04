var express = require('express');
var loadingRouter = express.Router();

var loadingController = require('./loading.controller');

loadingRouter.get('/loadingStatus', loadingController.loading_status);

loadingRouter.get('/firstRunStatus', loadingController.first_run_status);

module.exports = loadingRouter;

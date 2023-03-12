const express = require('express');
// eslint-disable-next-line new-cap
const loadingRouter = express.Router();

const loadingController = require('./loading.controller');

loadingRouter.get('/loadingStatus', loadingController.loadingStatus);

loadingRouter.get('/firstRunStatus', loadingController.firstRunStatus);

loadingRouter.get('/loadSenders', loadingController.loadSenders);

module.exports = loadingRouter;

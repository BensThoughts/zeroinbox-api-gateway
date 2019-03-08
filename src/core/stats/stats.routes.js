var express = require('express');
var statsRouter = express.Router();

const statsController = require('./stats.controller');

statsRouter.get('/stats', statsController.stats);

module.exports = statsRouter;
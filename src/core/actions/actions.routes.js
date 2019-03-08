var express = require('express');
var actionsRouter = express.Router();

const actionsController = require('./actions.controller');

actionsRouter.post('/actions', actionsController.postActions);

module.exports = actionsRouter;
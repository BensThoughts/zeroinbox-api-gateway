const express = require('express');
const actionsRouter = express.Router();

const actionsController = require('./actions.controller');

actionsRouter.post('/actions', actionsController.postActions);

module.exports = actionsRouter;

const express = require('express');
// eslint-disable-next-line new-cap
const actionsRouter = express.Router();

const actionsController = require('./actions.controller');

actionsRouter.post('/actions', actionsController.postActions);

module.exports = actionsRouter;

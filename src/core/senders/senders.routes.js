var express = require('express');
var sendersRouter = express.Router();

const sendersController = require('./senders.controller');

sendersRouter.get('/senders', sendersController.senders);

module.exports = sendersRouter;
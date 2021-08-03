const express = require('express');
const sendersRouter = express.Router();

const sendersController = require('./senders.controller');

sendersRouter.get('/senders', sendersController.senders);

module.exports = sendersRouter;

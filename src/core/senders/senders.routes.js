const express = require('express');
// eslint-disable-next-line new-cap
const sendersRouter = express.Router();

const sendersController = require('./senders.controller');

sendersRouter.get('/senders', sendersController.senders);

module.exports = sendersRouter;

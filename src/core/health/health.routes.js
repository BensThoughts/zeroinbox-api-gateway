const express = require('express');
// eslint-disable-next-line new-cap
const healthRouter = express.Router();

const healthController = require('./health.controller');

healthRouter.get('/healthcheck', healthController.healthCheck);

module.exports = healthRouter;

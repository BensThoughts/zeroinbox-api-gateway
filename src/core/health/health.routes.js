var express = require('express');
var healthRouter = express.Router();

const healthController = require('./health.controller');

healthRouter.get('/healthz', healthController.healthz);

healthRouter.get('/', healthController.healthz);

module.exports = healthRouter;
var express = require('express');
var labelsRouter = express.Router();

const labelsController = require('./labels.controller');

labelsRouter.get('/labels', labelsController.get_labels);

module.exports = labelsRouter;

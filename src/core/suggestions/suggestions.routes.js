var express = require('express');
var suggestionsRouter = express.Router();

const suggestionsController = require('./suggestions.controller');



suggestionsRouter.get('/suggestions', suggestionsController.suggestions);

module.exports = suggestionsRouter;

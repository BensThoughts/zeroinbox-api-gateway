var express = require('express');
var suggestionsRouter = express.Router();

const suggestionsController = require('./suggestions.controller');

suggestionsRouter.get('/suggestions', suggestionsController.suggestions);

suggestionsRouter.post('/suggestions', suggestionsController.postSuggestions);



module.exports = suggestionsRouter;

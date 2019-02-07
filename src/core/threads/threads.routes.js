var express = require('express');
var threadsRouter = express.Router();


const threadsBatchController = require('./threads_batch.controller')

threadsRouter.get('/batch', threadsBatchController.threads_batch);


module.exports = threadsRouter;

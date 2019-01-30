var express = require('express');
var threadsRouter = express.Router();

const threadsIdsController = require('./threads_ids.controller');

const threadsBatchController = require('./threads_batch.controller')


threadsRouter.get('/threads', threadsIdsController.get_threads_ids);

threadsRouter.get('/batch', threadsBatchController.threads_batch);


module.exports = threadsRouter;

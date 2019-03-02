var express = require('express');
var userRouter = express.Router();

var userController = require('./user.controller');

userRouter.get('/emailProfile', userController.email_profile);

userRouter.get('/basicProfile', userController.basic_profile);


module.exports = userRouter;

var express = require('express');
var userRouter = express.Router();

var userController = require('./user.controller');

userRouter.get('/email', userController.email_profile);

userRouter.get('/profile', userController.basic_profile);


module.exports = userRouter;
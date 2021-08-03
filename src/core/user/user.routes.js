const express = require('express');
const userRouter = express.Router();

const userController = require('./user.controller');

userRouter.get('/emailProfile', userController.emailProfile);

userRouter.get('/basicProfile', userController.basicProfile);


module.exports = userRouter;

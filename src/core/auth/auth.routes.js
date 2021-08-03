const express = require('express');
const authRouter = express.Router();

const authController = require('./auth.controller');

authRouter.get('/oauth2init', authController.oauth2init);

authRouter.get('/oauth2callback', authController.oauth2callback);

authRouter.get('/logout', authController.logout);

module.exports = authRouter;

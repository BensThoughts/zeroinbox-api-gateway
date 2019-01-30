var express = require('express');
var authRouter = express.Router();

const authController = require('./auth.controller');

authRouter.get('/oauth2init', authController.oauthinit);

authRouter.get('/oauth2callback', authController.oauth2callback);

authRouter.get('/logout', (req, res) => {
  req.session.destroy();
  res.json('Session Reset');
});


module.exports = authRouter;

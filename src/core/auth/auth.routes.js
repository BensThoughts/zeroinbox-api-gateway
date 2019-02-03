var express = require('express');
var authRouter = express.Router();

const authController = require('./auth.controller');

authRouter.get('/oauth2init', authController.oauth2init);

authRouter.get('/oauth2callback', authController.oauth2callback);

authRouter.get('/logout', (req, res) => {
  req.session.destroy();
  res.json('Session Reset');
});

authRouter.get('/test', (req, res) => {
  res.status(200).json({ name: 'john' });
})


module.exports = authRouter;

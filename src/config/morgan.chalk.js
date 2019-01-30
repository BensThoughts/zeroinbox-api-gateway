const chalk = require('chalk');

exports.logOK = function(token, req, res) {
    return [
      chalk.green.bold(token.method(req, res)),
      chalk.yellow.bold(token.status(req, res)),
      chalk.green(token.url(req, res)),
      chalk.yellow(token['response-time'](req,res) + 'ms'),
      chalk.white('@ ' + token.date(req, res))
    ].join(' ');
  };

exports.logError = function(token, req, res) {
    return [
      chalk.green.bold(token.method(req, res)),
      chalk.red.bold(token.status(req, res)),
      chalk.green(token.url(req, res)),
      chalk.yellow(token['response-time'](req,res) + 'ms'),
      chalk.white('@ ' + token.date(req, res))
    ].join(' ');
  };

const chalk = require('chalk');

exports.logOK = function(token, req, res) {
  let output = [''];
  try {
    output = [chalk.white(req.session.userInfo.userId + ' -')];
  } catch (e) {
    output = [''];
  }
  return output.concat([
    chalk.green.bold(token.method(req, res)),
    chalk.red.bold(token.status(req, res)),
    chalk.green(token.url(req, res)),
    chalk.yellow('- Response Time: ' + token['response-time'](req, res) + 'ms'),
    chalk.white('@ ' + token.date(req, res)),
  ]).join(' ');
};

exports.logError = function(token, req, res) {
  let output = [''];
  try {
    output = [chalk.white(req.session.userInfo.userId + ' -')];
  } catch (e) {
    output = [''];
  }
  return output.concat([
    chalk.green.bold(token.method(req, res)),
    chalk.red.bold(token.status(req, res)),
    chalk.green(token.url(req, res)),
    chalk.yellow('- Response Time: ' + token['response-time'](req, res) + 'ms'),
    chalk.white('@ ' + token.date(req, res)),
  ]).join(' ');
};

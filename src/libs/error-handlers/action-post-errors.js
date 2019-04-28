const logger = require('../loggers/log4js');

function actionPostErrors(req, res, next) {
    let path = req.path;
    let method = req.method;
    if (path === '/v1/actions' && method === 'POST') {
        return checkPostBody(req, res, next);
    } else {
        return next();
    }
}

function checkPostBody(req, res, next) {
    let body = req.body;
    let bodyCheck = checkBody(body);
    if (bodyCheck.error) {
        return res.status(400).json({
            status: 'error',
            status_message: bodyCheck.error_message
        });
    } else {
        return next();
    }
}


function checkBody(body) {
    return {
        error: false
    }
}

module.exports = actionPostErrors;

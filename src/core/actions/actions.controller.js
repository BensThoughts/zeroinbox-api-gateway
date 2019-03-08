const logger = require('../../libs/loggers/log4js');

exports.postActions = function(req, res) {
    let body = req.body;
    logger.trace(body);
    let bodyCheck = checkBody(body);
    if (bodyCheck.error) {
        res.status(400).json({
            status: 'error',
            status_message: bodyCheck.error_message
        });
    } else {
        res.status(200).json({
            status: 'success',
            status_message: 'OK',
            data: {
                body: body
            }
        });
    }
}

function checkBody(body) {
    if (body.label || body.filter || body.delete) {
        if (body.label) {
            let labelTypeCheck = checkArrayType(body.label);
            if (labelTypeCheck.error) {
                return {
                    error: true,
                    error_message: 'label is not of type Array'
                }
            }
        }
        if (body.filter) {
            let filterTypeCheck = checkArrayType(body.filter);
            if (filterTypeCheck.error) {
                return {
                    error: true,
                    error_message: 'filter is not of type Array'
                }
            }
        }
        if (body.delete) {
            let deleteTypeCheck = checkArrayType(body.delete);
            if (deleteTypeCheck.error) {
                return {
                    error: true,
                    error_message: 'delete is not of type Array'
                }
            }
        }
        return {
            error: false
        }
    } else {
        return {
            error: true,
            error_message: 'Body must include one of label, filter, or delete as arrays of senderIds'
        }
    }
}

function checkArrayType(array) {
    if (!Array.isArray(array)) {
        return {
            error: true,
            error_message: 'Type is not array, make sure label, filter, and delete are all arrays'
        }
    } else {
        return {
            error: false,
        }
    }
}


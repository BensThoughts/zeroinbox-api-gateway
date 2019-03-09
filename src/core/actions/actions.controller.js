const logger = require('../../libs/loggers/log4js');
const { publishActions } = require('../../libs/utils/rabbit.utils');

exports.postActions = function(req, res) {
    let userId = req.session.user_info.userId;
    let body = req.body;
    logger.trace(body);
    logger.trace(userId);
    let bodyCheck = checkBody(body);
    if (bodyCheck.error) {
        res.status(400).json({
            status: 'error',
            status_message: bodyCheck.error_message
        });
    } else {
        if (body.label && body.delete) {
            let duplicateLabelCheck = checkDuplicate(body.label, body.delete);
            if (duplicateLabelCheck) {
                return res.status(400).json({
                    status: 'error',
                    status_message: 'Cannot delete and label the same threadId'
                });       
            }
        }
        if (body.filter && body.delete) {
            let duplicateFilterCheck = checkDuplicate(body.filter, body.delete);
            if (duplicateFilterCheck) {
                return res.status(400).json({
                    status: 'error',
                    status_message: 'Cannot delete and filter the same threadId'
                });
            }
        }
        publishActions(userId, body);
        res.status(200).json({
            status: 'success',
            status_message: 'OK',
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

function checkDuplicate(array1, array2) {
    let elementsInBoth = array1.filter((threadId) => {
        let index = array2.indexOf(threadId);
        if (index === -1) {
            return false;
        }
        return true;
    });
    if (elementsInBoth.length > 0) {
        return true;
    }
    return false;
}


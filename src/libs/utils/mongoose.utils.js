const logger = require('../loggers/log4js');

const History = require('../../models/history.model');
const Profile = require('../../models/profile.model');
const Sender = require('../../models/sender.model');
const Suggestion = require('../../models/suggestion.model');


exports.upsertToHistory = function (userId, doc, callback) {
    let conditions = { userId: userId }
    let options = {
        upsert: true,
        mutli: false
    }
    History.updateOne(conditions, doc, options, (err, doc) => {
        if (callback) {
            callback(err, doc);
        } else if (err) {
            logger.error('Error in History.updateOne(): ' + err);
        }
    });
}

exports.findOneHistory = function(userId, callback) {
    let conditions = { userId: userId }
    History.findOne(conditions, (err, doc) => {
        callback(err, doc);
    });
}

exports.upsertToProfile = function(userId, doc, callback) {
    let conditions = { userId: userId }
    let options = {
        upsert: true,
        multi: false
    }
    Profile.updateOne(conditions, doc, options, (err, doc) => {
        if (callback) {
            callback(err, doc);
        } else if (err) {
            logger.error('Error in Profile.updateOne(): ' + err);
        }
    });
}


function findSenderPromise(userId, senderId) {
    return new Promise((resolve, reject) => {
        let conditions = {
            userId: userId,
            senderId: senderId
        }
        let senderProjection = {
            "senderAddress": 1,
            "senderNames": 1,
            "totalSizeEstimate": 1,
            "senderId": 1,
            "count": 1,
            _id: 0
          }
        Sender.find(conditions, senderProjection, (err, raw) => {
            if (err) {
                reject(err);
            } else {
                resolve(raw);
            }
        });
    });
}

exports.findSender = function(userId, senderId) {
    return findSenderPromise(userId, senderId);
}

exports.findSenderIds = function(userId, callback) {
    let criteria = { userId, userId };
    
    Suggestion.find().distinct('senderId', criteria, (err, raw) => {
        callback(err, raw);
    });
}
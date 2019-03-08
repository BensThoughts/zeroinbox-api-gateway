const logger = require('../loggers/log4js');

const History = require('../../models/history.model');
const Profile = require('../../models/profile.model');
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

exports.findSuggestion = function(userId, callback) {
    let conditions = { userId: userId };

    let projection = {
      "senderAddress": 1,
      "senderNames": 1,
      "totalSizeEstimate": 1,
      "senderId": 1,
      "count": 1,
      _id: 0
    }

    Suggestion.find(conditions, projection, (err, raw) => {
        callback(err, raw);
    });
}
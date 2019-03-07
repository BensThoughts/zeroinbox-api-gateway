const logger = require('../loggers/log4js');

const History = require('../../models/history.model');
const Profile = require('../../models/profile.model');

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
    History.findOne(conditions, callback);
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
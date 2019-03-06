const History = require('../../core/models/history.model');

exports.upsertToHistory = function (userId, doc, callback) {
    let conditions = { userId: userId }
    let options = {
        upsert: true,
        mutli: false
    }
    History.updateOne(conditions, doc, options, (err, doc) => {
        if (callback) {
            callback(err, doc);
        }
    });
}

exports.findOneHistory = function(userId, callback) {
    let conditions = { userId: userId }
    History.findOne(conditions, callback);
}
const History = require('../../core/models/history.model');

function upsertToHistory(userId, doc, callback) {
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

module.exports = {
    upsertToHistory
}
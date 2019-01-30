/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/

// const mongodb = require('mongodb');
const mongoose = require('mongoose');
// const client = mongodb.MongoClient;
let Schema = mongoose.Schema;

const historySchema = new Schema({
  userId: String,
  active: {
    loading: Boolean,
    loaded: Number
  },
  passive: {
    firstRun: Boolean,
    firstRunDate: Date,
    lastRunDate: Date
  }
});

const History = mongoose.model('History', historySchema);

module.exports = History;

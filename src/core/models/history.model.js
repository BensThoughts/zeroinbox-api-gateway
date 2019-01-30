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
    loadingStatus: Boolean,
    percentLoaded: Number
  },
  passive: {
    firstRun: Boolean,
    firstRunDate: Date,
    lastRunDate: Date
  }
});

const History = mongoose.model('History', historySchema);

module.exports = History;

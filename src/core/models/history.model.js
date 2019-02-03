/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

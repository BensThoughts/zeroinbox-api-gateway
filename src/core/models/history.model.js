/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  cookie: { type: String, required: false },
  access_token: { type: String, required: true },
  expiry_date: { type: String, required: true },
  token_type: { type: String, required: true },
  scope: { type: String, required: true },
  refresh_token: { type: String, required: false },
});

const historySchema = new Schema({
  userId: String,
  active: {
    loadingStatus: Boolean,
    percentLoaded: Number,
    session: sessionSchema
  },
  passive: {
    firstRun: Boolean,
    firstRunDate: Date,
    lastRunDate: Date
  },
});

const History = mongoose.model('History', historySchema);

module.exports = History;

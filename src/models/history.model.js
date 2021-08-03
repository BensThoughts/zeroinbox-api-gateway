/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  sessionID: { type: String, required: false },
  accessToken: { type: String, required: false },
  expiryDate: { type: String, required: false },
  tokenType: { type: String, required: false },
  scope: { type: String, required: false },
  refreshToken: { type: String, required: false },
});

const historySchema = new Schema({
  userId: String,
  active: {
    session: sessionSchema,
    loggedIn: Boolean
  },
  passive: {
    firstRun: Boolean,
    firstRunDate: Date,
    lastRunDate: Date
  },
});

const History = mongoose.model('History', historySchema);

module.exports = History;

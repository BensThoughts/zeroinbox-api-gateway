/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loadingSchema = new Schema({
  userId: { type: String, required: true },
  loadingStatus: { type: Boolean, require: false },
  percentLoaded: { type: Number, require: false },
  resultsPerPage: { type: Number, required: true },
  threadIdCount: { type: Number, required: true },
  actionsLock: { type: Boolean, required: false }
});

const LoadingStatus = mongoose.model('Loading-Status', loadingSchema);

module.exports = LoadingStatus;
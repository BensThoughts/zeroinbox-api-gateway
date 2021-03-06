const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loadingSchema = new Schema({
  userId: {type: String, required: true},
  loadingStatus: {type: Boolean, require: false},
  percentLoaded: {type: Number, require: false},
  resultsPerPage: {type: Number, required: true},
  messageIdTotal: {type: Number, required: true},
});

const LoadingStatus = mongoose.model('Loading-Status', loadingSchema);

module.exports = LoadingStatus;

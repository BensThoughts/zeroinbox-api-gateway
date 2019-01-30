/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/

// const mongodb = require('mongodb');
const mongoose = require('mongoose');
// const client = mongodb.MongoClient;
let Schema = mongoose.Schema;

const loadingSchema = new Schema({
  userId: String,
  loading: Boolean,
  loaded: Number
});

const Loading = mongoose.model('Loading', loadingSchema);

module.exports = Loading;

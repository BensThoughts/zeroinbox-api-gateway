/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/

// const mongodb = require('mongodb');
const mongoose = require('mongoose');
// const client = mongodb.MongoClient;
let Schema = mongoose.Schema;

const threadIdsSchema = new Schema({
  userId: String,
  threadIds: [String]
});

const ThreadIds = mongoose.model('ThreadIds', threadIdsSchema);

module.exports = ThreadIds;

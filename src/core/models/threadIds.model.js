/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/

// const mongodb = require('mongodb');
const mongoose = require('mongoose');
// const client = mongodb.MongoClient;
let Schema = mongoose.Schema;

const threadIdSchema = new Schema({
  userId: String,
  threadId: String
});

const ThreadId = mongoose.model('ThreadIds', threadIdSchema);

module.exports = ThreadId;

/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadIdSchema = new Schema({
  userId: String,
  threadId: String
});

const ThreadId = mongoose.model('Thread_Ids', threadIdSchema);

module.exports = ThreadId;

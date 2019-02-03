/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadIdSchema = new Schema({
  userId: { type: String, required: true },
  threadId: { type: String, required: true },
});

const ThreadId = mongoose.model('Thread_Ids', threadIdSchema);

module.exports = ThreadId;

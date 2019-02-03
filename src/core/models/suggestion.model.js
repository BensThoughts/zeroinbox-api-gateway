/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const sendersSchema = new Schema({
  id: String,
  fromNames: [String],
  fromAddress: String,
  threadIds_internalDates: [{threadId: String, internalDate: Number}],
  totalSizeEstimate: Number,
  count: Number
})

sendersSchema.methods.addOneToCount = function() {
  this.count++
};

sendersSchema.methods.getId = function() {
  return this.id;
}

sendersSchema.methods.concatNames = function(name) {
  this.fromNames = this.fromNames.concat(name);
}

sendersSchema.methods.concatThreadIds_internalDates = function(threadIds_internalDates) {
  this.threadIds_internalDates = this.threadIds_internalDates.concat(threadIds_internalDates);
}

sendersSchema.methods.addToTotalSizeEstimate = function(totalSizeEstimate) {
  this.totalSizeEstimate = this.totalSizeEstimate + totalSizeEstimate;
}

const suggestionSchema = new Schema({
  userId: String,
  emailAddress: String,
  emailId: String,
  senderId: String,
  sender: sendersSchema
});

const Suggestion = mongoose.model('suggestions', suggestionSchema);

module.exports = Suggestion;

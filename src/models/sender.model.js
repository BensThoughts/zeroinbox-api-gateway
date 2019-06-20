/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');


var notEmpty = function(features){
  if(features.length === 0){return false}
  else {return true};
}

const senderSchema = new Schema({
  userId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderNames: { type: [String], required: true, validate: [notEmpty, 'Please add at least one string to senderNames[]'] },
  senderAddress: { type: String, required: true },
  unsubscribeWeb: { type: String, required: false },
  unsubscribeEmail: { type: String, required: false },
  unsubscribed: { type: Boolean, required: true },
  threadIds: { type: [String], required: true, validate: [notEmpty, 'Please add a threadId to threadIds[]']},
  messageIds: { type: [String], required: true, validate: [notEmpty, 'Please add a messageId to messageIds[]']},
  totalSizeEstimate: { type: Number, required: true },
});

senderSchema.statics.createSenderId = function(senderAddress) {
  let md5sum = crypto.createHash('md5');
  md5sum.update(senderAddress);

  let id = md5sum.digest('hex');
  // this.senderId = id;
  return id;
}

const Sender = mongoose.model('senders', senderSchema);


module.exports = Sender



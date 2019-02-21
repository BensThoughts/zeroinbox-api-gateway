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

const suggestionSchema = new Schema({
  userId: { type: String, required: true },
  senderId: { type: String, required: true },
  // senderNames: [{ type: String, required: true }],
  senderNames: { type: [String], required: true, validate: [notEmpty, 'Please add at least one threadId'] },
  senderAddress: { type: String, required: true },
  // threadIds_internalDates: { type: [{threadId: String, internalDate: Number}], required: true },
  threadIds_internalDates: { type: [{ 
    threadId: {type: String, required: true}, 
    internalDate: {type: Number, required: true } }
  ], required: true, validate: [notEmpty, 'Please add a threadId_internalDate'] },
  totalSizeEstimate: { type: Number, required: true },
  count: { type: Number, required: true },
});

suggestionSchema.statics.createSenderId = function(senderAddress) {
  let md5sum = crypto.createHash('md5');
  md5sum.update(senderAddress);

  let id = md5sum.digest('hex');
  // this.senderId = id;
  return id;
}

const Suggestion = mongoose.model('suggestions', suggestionSchema);


module.exports = Suggestion

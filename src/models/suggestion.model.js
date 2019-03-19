const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suggestionSchema = new Schema({
  userId: { type: String, required: true },
  senderId: { type: String, required: true },
  subscriptionList: { type: Boolean, required: false },
  delete: { type: Boolean, required: true },
  labelByName: { type: Boolean, required: true },
  labelBySize: { type: Boolean, required: true },
  labelNames: { type: [String], required: true },
  sizeGroup: { type: String, required: false },
});

const Suggestion = mongoose.model('suggestion', suggestionSchema);

module.exports = Suggestion;
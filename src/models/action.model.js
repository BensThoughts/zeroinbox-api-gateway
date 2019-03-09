const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionSchema = new Schema({
  userId: { type: String, required: true },
  senderId: { type: String, required: true },
  action: { type: String, required: true }
});

const Action = mongoose.model('action', actionSchema);

module.exports = Action;
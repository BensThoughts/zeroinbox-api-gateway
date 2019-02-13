/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: { type: String, required: false },
  access_token: { type: String, required: true },
  expiry_date: { type: String, required: true },
  token_type: { type: String, required: true },
  scope: { type: String, required: true },
  refresh_token: { type: String, required: false },
});

const Token = mongoose.model('Tokens', tokenSchema);

module.exports = Token;
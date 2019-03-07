/*******************************************************************************
 * MONGODB INIT
 ******************************************************************************/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailProfileSchema = new Schema({
    emailId: String,
    emailAddress: String,
    messagesTotal: Number,
    threadsTotal: Number,
    historyId: String
});

const basicProfileSchema = new Schema({
    id: String,
    name: String,
    given_name: String,
    family_name: String,
    link: String,
    picture: String,
    locale: String,
})

const profileSchema = new Schema({
  userId: String,
  basic: basicProfileSchema,
  email: emailProfileSchema,
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;

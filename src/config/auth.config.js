const dotenv = require('dotenv');
const test = dotenv.config();
console.log(test);

module.exports = {
    G_OAUTH_CLIENT_ID: process.env.G_OAUTH_CLIENT_ID,
    G_OAUTH_CLIENT_SECRET: process.env.G_OAUTH_CLIENT_SECRET,
    G_OAUTH_REDIRECT_URL: process.env.G_OAUTH_REDIRECT_URL,
    G_OAUTH_ACCESS_TYPE: process.env.G_OAUTH_ACCESS_TYPE,
    G_OAUTH_PROMPT: process.env.G_OAUTH_PROMPT,
    ZERO_INBOX_REDIRECT_URL: process.env.ZERO_INBOX_REDIRECT_URL,
    G_OAUTH_SCOPES: process.env.G_OAUTH_SCOPES,
}
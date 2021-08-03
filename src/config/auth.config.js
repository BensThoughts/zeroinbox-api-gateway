module.exports = {
  CLIENT_ID: String(process.env.G_OAUTH_CLIENT_ID),
  CLIENT_SECRET: String(process.env.G_OAUTH_CLIENT_SECRET),
  OAUTH_REDIRECT_URL: String(process.env.G_OAUTH_REDIRECT_URL),
  ACCESS_TYPE: String(process.env.G_OAUTH_ACCESS_TYPE),
  PROMPT: String(process.env.G_OAUTH_PROMPT),
  AUTH_SUCCESS_REDIRECT_URL: String(process.env.AUTH_SUCCESS_REDIRECT_URL),
  AUTH_FAILURE_REDIRECT_URL: String(process.env.AUTH_FAILURE_REDIRECT_URL),
};

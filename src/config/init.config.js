module.exports = {
  NODE_ENV: String(process.env.NODE_ENV),
  // Express
  EXPRESS_PORT: Number(process.env.EXPRESS_PORT),
  EXPRESS_HOST: String(process.env.EXPRESS_HOST),
  CORS_WHITELIST: String(process.env.CORS_WHITELIST || ''),
  // SESSION_REDIS_HOST: String(process.env.SESSION_REDIS_HOST),
  // SESSION_REDIS_PORT: Number(process.env.SESSION_REDIS_PORT),
  // SESSION_REDIS_URL: String(process.env.SESSION_REDIS_URL),
  SESSION_SECRET: String(process.env.SESSION_SECRET),
  LOG_LEVEL: String(process.env.LOG_LEVEL || 'production'),

  // Google
  BASIC_PROFILE_ENDPOINT: String(process.env.BASIC_PROFILE_ENDPOINT || 'https://www.googleapis.com/oauth2/v2/userinfo'),
  GMAIL_PROFILE_ENDPOINT: String(process.env.GMAIL_PROFILE_ENDPOINT || 'https://www.googleapis.com/gmail/v1/users/me/profile'),
  OAUTH_TOKEN_URL: String(process.env.OAUTH_TOKEN_URL || 'https://www.googleapis.com/oauth2/v4/token'),
  GAPI_INIT_RETRY_DELAY: Number(process.env.GAPI_INIT_RETRY_DELAY || 500),
  GAPI_DELAY_MULTIPLIER: Number(process.env.GAPI_DELAY_MULTIPLIER || 2),
  GAPI_MAX_RETRIES: Number(process.env.GAPI_MAX_RETRIES || 3),
  DEFAULT_PERCENT_LOADED: Number(process.env.DEFAULT_PERCENT_LOADED || 10),

  // Mongo DB
  MONGO_URI: String(process.env.MONGO_URI),
};

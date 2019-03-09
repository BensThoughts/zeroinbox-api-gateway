module.exports = {
    express_port: process.env.EXPRESS_PORT,
    express_host: process.env.EXPRESS_HOST,
    cors_whitelist: process.env.CORS_WHITELIST || '',
    session_redis_host: process.env.SESSION_REDIS_HOST,
    session_redis_port: process.env.SESSION_REDIS_PORT,
    session_secret: process.env.SESSION_SECRET,
    mongo_uri: process.env.MONGO_URI,
    log_level: process.env.LOG_LEVEL || 'production',
    BASIC_PROFILE_ENDPOINT: process.env.BASIC_PROFILE_ENDPOINT || 'https://www.googleapis.com/oauth2/v2/userinfo',
    GMAIL_PROFILE_ENDPOINT: process.env.GMAIL_PROFILE_ENDPOINT || 'https://www.googleapis.com/gmail/v1/users/me/profile',
    GAPI_INIT_RETRY_DELAY: process.env.GAPI_INIT_RETRY_DELAY || 500,
    GAPI_DELAY_MULTIPLIER: process.env.GAPI_DELAY_MULTIPLIER || 2,
    GAPI_MAX_RETRIES: process.env.GAPI_MAX_RETRIES || 3,
    DEFAULT_PERCENT_LOADED: process.env.DEFAULT_PERCENT_LOADED || 10
}
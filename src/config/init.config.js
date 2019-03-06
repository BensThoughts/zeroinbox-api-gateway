module.exports = {
    express_port: process.env.EXPRESS_PORT,
    express_host: process.env.EXPRESS_HOST,
    cors_whitelist: process.env.CORS_WHITELIST.split(','),
    session_redis_host: process.env.SESSION_REDIS_HOST,
    session_redis_port: process.env.SESSION_REDIS_PORT,
    session_secret: process.env.SESSION_SECRET,
    mongo_uri: process.env.MONGO_URI,
    log_level: process.env.LOG_LEVEL,
    BASIC_PROFILE_ENDPOINT: process.env.BASIC_PROFILE_ENDPOINT,
    GMAIL_PROFILE_ENDPOINT: process.env.GMAIL_PROFILE_ENDPOINT,
    GAPI_INIT_RETRY_DELAY: process.env.GAPI_INIT_RETRY_DELAY,
    GAPI_DELAY_MULTIPLIER: process.env.GAPI_DELAY_MULTIPLIER,
    GAPI_MAX_RETRIES: process.env.GAPI_MAX_RETRIES,
    DEFAULT_PERCENT_LOADED: process.env.DEFAULT_PERCENT_LOADED
}
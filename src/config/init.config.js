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
    GMAIL_PROFILE_ENDPOINT: process.env.GMAIL_PROFILE_ENDPOINT
}
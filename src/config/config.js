
module.exports = function() {
    switch(process.env.NODE_ENV) {
        case 'development':
            return {
                db: 'mongodb://mongo:27017/zero-inbox',
                host: '0.0.0.0',
                port: process.env.PORT || 3000
            }
        case 'production':
            return {
                db: 'mongodb://mongo:27017/zero-inbox',
                host: '0.0.0.0',
                port: process.env.PORT || 3000
            }
        case 'test':
            return {
                db: 'mongodb://localhost/zero-inbox',
                host: '0.0.0.0',
                port: process.env.PORT || 3333
            }
        default:
            return { error: 'error' }
    }
}
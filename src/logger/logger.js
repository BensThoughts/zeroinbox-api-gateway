const winston = require('winston');
// const LogstashTransport = require('winston-logstash-transport');

// winston.add(winston.transports.Logstash({
//  port: 5000,
//  host: 'logstash'
// }));
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '../logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../logs/combined.log' }),
    // new LogstashTransport({host: 'logstash', port: 5000 })
  ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

module.exports = logger;
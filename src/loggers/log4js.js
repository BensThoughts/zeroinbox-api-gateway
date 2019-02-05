const log4js = require('log4js');
let nodeENV = process.env.NODE_ENV;

if (nodeENV === 'production') {
    log4js.configure({
        appenders: { out: { type: 'stdout' } },
        categories: { default: { appenders: ['out'], level: info } }
    });
} else {
    log4js.configure({
        appenders: { 
            stdout: { type: 'stdout' },
            stderr: { type: 'stderr' },
            debug: { 
                type: 'file', 
                filename: '../logs/debug.log', 
                maxLogSize: 5485760, 
                backups: 5, 
                compress: true 
            },
            error: {
                type: 'file', 
                filename: '../logs/error.log', 
                maxLogSize: 10485760, 
                backups: 3, 
                compress: true 
            },
            info: {
                type: 'file', 
                filename: '../logs/info.log', 
                maxLogSize: 10485760, 
                backups: 3, 
                compress: true  
            },

            // log info to info.log
            _info: { type: 'logLevelFilter', appender: 'info', level: 'info', maxLevel: 'info' },
            
            /** Debug Setting */
            // uncomment below to provide trace - info level logging to stout
            // _stdout: { type: 'logLevelFilter', appender: 'stdout', level: 'trace', maxLevel: 'info' },

            // log info to stdout
            _stdout: { type: 'logLevelFilter', appender: 'stdout', level: 'info', maxLevel: 'info' },
            
            // log fatal - warn to error.log
            _error: { type: 'logLevelFilter', appender: 'error', level: 'warn', maxLevel: 'fatal' },

            /** Production Setting */
            // uncomment below to provide error - fatal level logging to stderr
            // _stderr: { type: 'logLevelFilter', appender: 'stderr', level: 'error', maxLevel: 'fatal' },
            
            /** Dev Setting */
            // log fatal - error to stderr
            _stderr: { type: 'logLevelFilter', appender: 'stderr', level: 'warn', maxLevel: 'fatal' },

            // log trace - fatal to debug.log
            _trace: { type: 'logLevelFilter', appender: 'debug', level: 'trace' }
        },
        categories: { 
            default: { appenders: ['_stdout'], level: 'info' },
            filter: { appenders: ['_info', '_stdout', '_error', '_stderr', '_trace'], level: 'trace' }
        }
    });
}

const logger = log4js.getLogger('filter');

module.exports = logger;
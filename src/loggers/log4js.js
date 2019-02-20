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

            _info: { type: 'logLevelFilter', appender: 'info', level: 'info', maxLevel: 'info' },
 
            _error: { type: 'logLevelFilter', appender: 'error', level: 'warn', maxLevel: 'fatal' },

            _trace: { type: 'logLevelFilter', appender: 'debug', level: 'trace' },


            /** Dev Setting */
            _stdout_debug: { type: 'logLevelFilter', appender: 'stdout', level: 'debug', maxLevel: 'info' },
            _stdout_trace: { type: 'logLevelFilter', appender: 'stdout', level: 'trace', maxLevel: 'info' },

            /** Prod Setting */
            _stdout_prod: { type: 'logLevelFilter', appender: 'stdout', level: 'info', maxLevel: 'info' },


            /** Dev Setting */
            _stderr_debug: { type: 'logLevelFilter', appender: 'stderr', level: 'warn', maxLevel: 'fatal' },

            /** Prod Setting */
            _stderr_prod: { type: 'logLevelFilter', appender: 'stderr', level: 'error', maxLevel: 'fatal' },

        },
        categories: { 
            default: { appenders: ['_stdout_prod'], level: 'info' },
            dev: { appenders: ['_info', '_stdout_debug', '_error', '_stderr_debug', '_trace'], level: 'trace' },
            dev_trace: { appenders: ['_info', '_stdout_trace', '_error', '_stderr_debug', '_trace'], level: 'trace' },
            prod: { appenders: ['_info', '_stdout_prod', '_error', '_stderr_prod', '_trace'], level: 'trace' }
        }
    });
}

// switch getLogger('prod') for prod
const logger = log4js.getLogger('dev_trace');

module.exports = logger;
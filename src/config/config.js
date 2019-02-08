const fs = require('fs');
const path = require('path');
const workdir = path.resolve(__dirname) + '/'
const logger = require(workdir + '../loggers/log4js');

module.exports = function() {
    let env = process.env.NODE_ENV;
    switch(env) {
        case 'development':
            const devConfig = fs.readFileSync(workdir + './dev/dev.config.json');
            logger.info('Dev Config: ' + devConfig.toString());
            return JSON.parse(devConfig.toString());
        
        case 'production':
            const prodConfig = fs.readFileSync(workdir + './prod/prod.config.json');
            logger.info('Prod Config: ' + prodConfig.toString());
            return JSON.parse(prodConfig.toString());
            
        case 'test':
            const testConfig = fs.readFileSync(workdir + './test/test.config.json');
            logger.info('Test Config: ' + testConfig.toString());
            return JSON.parse(testConfig.toString());

        default:
            return Error('Error loading config files, ' + env + ' environment not found!');
    }
}
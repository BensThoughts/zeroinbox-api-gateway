logger = require('../../libs/loggers/log4js');

exports.stats = function(req, res) {
    let query = req.query;
    logger.trace(query);
    res.status(200).json({
        status: 'success',
        status_message: 'OK',
        data: {
            stats: query
        }
    });

}
logger = require('../../libs/loggers/log4js');

exports.stats = function(req, res) {
    let query = req.query;
    let queryCheck = checkQuery(query);
    if (queryCheck.error) {
        res.status(400).json({
            status: 'error',
            status_message: queryCheck.status_message
        });
    } else {
        res.status(200).json({
            status: 'success',
            status_message: 'OK',
            data: {
                stats: query
            }
        });
    }
}

function checkQuery(query) {
  let isEmpty = Object.keys(query).length === 0; // might have to add this later: && query.constructor === Object;
  if (isEmpty) {
    let errorMessage = 'no query sent, please include "filter" and "stats" in your query!';
    return {
      error: true,
      status_message: errorMessage
    }
  }
  if (!query.filter) {
    let errorMessage = 'query param "filter" is not set in query!';
    return {
        error: true,
        status_message: errorMessage
    }
  }
  if (!query.stats) {
    let errorMessage = 'query param "stats" is not set in query!';
    return {
      error: true,
      status_message: errorMessage
    }  
  }

  let filterCheck = checkFilter(query);
  let statsCheck = checkStats(query);
  if (filterCheck.error) {
    return {
      error: true,
      error_message: filterCheck.error_message
    };
  } else if (statsCheck.error) {
    return {
      error: true,
      error_message: statsCheck.error_message
    }
  } else {
    return {
      error: false
    }
  }

}

function checkFilter(query) {
  switch (query.filter) {
    case 'thread_count':
      return {
        error: false,
      }
    case 'size':
      return {
        error: false
      }
    default:
      let errorMessage = 'error in query param "filter", needs to be one of "threads" or "size"'
      return {
        error: true,
        error_message: errorMessage
      }
  }
}

function checkStats(query) {
  switch (query.stats) {
    case 'thread_count':
      return {
        error: false,
      }
    case 'size':
      return {
        error: false
      }
    case 'senders':
      return {
        error: false
      }
    default:
      let errorMessage = 'error in query param "stats", needs to be one of "thread_count", "size", or "senders"'
      return {
        error: true,
        error_message: errorMessage
      }
  }
}
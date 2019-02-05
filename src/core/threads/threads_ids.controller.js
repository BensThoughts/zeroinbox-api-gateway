/*******************************************************************************
Get All ThreadIds
*******************************************************************************/
const logger = require('../../loggers/log4js');
const request = require('request');

const ThreadId = require('../models/thread_IDs.model');
const History = require('../models/history.model');

const GMAIL_THREADS_ENDPOINT = 'https://www.googleapis.com/gmail/v1/users/me/threads';
const LABEL_IDS = 'INBOX';
const MAX_RESULTS = 500;


get_threads_ids = function (req, res) {

  let userId = req.session.user_info.userId;

  let conditions = { userId: userId };
    
      let access_token = req.session.token.access_token;
      
      let threadIdsResults = new ThreadIdsResults();

      getPages(access_token, []).then((results) => {

        logger.debug('Total number of threads: ' + results.length);

        results.forEach((thread) => {
          let threadId = createThreadId(thread.id, userId);
          threadIdsResults.addToResults(threadId);
        });

        ThreadId.insertMany(threadIdsResults.getResults(), (err, docs) => {
          if (err) return logger.error('Error in ThreadId.insertMany(): threadids_controller: ' + err);
          logger.debug('Thread Ids Updated!');

          // make sure threadIds are inserted before proceeding to batch get
        });

      }).catch((err) => {
        logger.error(err);
        res.status(500).send({ error: 'Request failed with error: ' + err })
      });

}

async function getPages(access_token, results, nextPageToken) {

  let response = await getPageOfThreads(access_token, nextPageToken).catch((error) => {
    logger.error('Error in getPageOfThreads!' + error);
  });

  results = results.concat(response.threads);
  nextPageToken = response.nextPageToken;

  if (nextPageToken) {
    // QUESTION: maybe return await getPages()?
    return getPages(access_token, results, nextPageToken);
  }
  return results;
}

function getPageOfThreads(access_token, pageToken) {

  let options = createOptions(access_token, pageToken);

  return new Promise((resolve, reject) => {

    request.get(options, (error, response, body) => {

      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        logger.debug('Next page token: ' + body.nextPageToken);
        resolve(body)
      } else {
        logger.error('Error in request.get: ' + error);
        reject(error);
      }

    })

  })

}

function createOptions(access_token, pageToken) {
  // QUESTION: is it better to return a map?
  if (pageToken) {
    return {
        url: GMAIL_THREADS_ENDPOINT,
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        qs: {
          maxResults: MAX_RESULTS,
          labelIds: LABEL_IDS,
          pageToken: pageToken
        },
    };
  } else {
    return {
        url: GMAIL_THREADS_ENDPOINT,
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        qs: {
          maxResults: MAX_RESULTS,
          labelIds: LABEL_IDS,
        }   
    }
  }
}

function createThreadId(threadId, userId) {
  return new ThreadId({
    userId: userId,
    threadId: threadId
  })
}

class ThreadIdsResults {
  constructor() {
    this.results = []; // Array<ThreadId>
    this.empty = false;
  }

  getResults() {
    return this.results;
  }

  addToResults(threadId) {
    this.results.push(threadId);
  }
}

let node_env = process.env.NODE_ENV;

if (node_env === 'production' || node_env === 'development') {
  module.exports = {
    get_threads_ids
  }
}

if (node_env === 'test') {
  module.exports = {
    get_threads_ids,
    createOptions,
    createThreadId,
    ThreadIdsResults
  }
}
/*******************************************************************************
Get All ThreadIds
*******************************************************************************/

const request = require('request');
const chalk = require('chalk');

const configDB = require('../../config/database');
const mongoose = require('mongoose');

const ThreadId = require('../models/thread_IDs.model');
const History = require('../models/history.model');

const LABEL_IDS = 'INBOX';
const MAX_RESULTS = 500;
const GMAIL_THREADS_URL = 'https://www.googleapis.com/gmail/v1/users/me/threads';

exports.get_threads_ids = function (req, res) {

  let user_info = req.session.user_info;
  let userId = user_info.userId;

  let conditions = { userId: user_info.userId };

  History.findOne(conditions, (err, doc) => {
    
    if (err) return console.error(chalk.red('Error in History.findOne: thread_ids.controller: ' + err));
    
    if (!doc.passive.firstRun) {
      res.json({ loading_status: false });
    } else {
    
      let access_token = req.session.token.access_token;
      
      let threadIdsResults = new ThreadIdsResults();

      getPages(access_token, []).then((results) => {

        console.log(chalk.yellow('Total number of threads: ' + results.length));

        results.forEach((thread) => {
          let threadId = createThreadId(thread.id, userId);
          threadIdsResults.addToResults(threadId);
        });

        ThreadId.insertMany(threadIdsResults.getResults(), (err, docs) => {
          if (err) return console.error(chalk.red('Error in ThreadId.insertMany(): threadids_controller: ' + err));
          console.log(chalk.blue.bold('Thread Ids Updated!'));

          // make sure threadIds are inserted before proceeding to batch get
          res.json({ loading_status: true })
        });

      }).catch((err) => {
        console.error(chalk.red(err));
        res.status(500).send({ error: 'Request failed with error: ' + err })
      });

    }

  });

}

async function getPages(access_token, results, nextPageToken) {

  let response = await getPageOfThreads(access_token, nextPageToken).catch((error) => {
    console.error(chalk.red('Error in getPageOfThreads!' + error));
  });

  results = results.concat(response.threads);
  nextPageToken = response.nextPageToken;

  if (nextPageToken) {
    // maybe return await?
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
        // console.log('body: ' + body.threads);
        console.log(chalk.yellow('Next page token: ' + body.nextPageToken));
        resolve(body)
      } else {
        console.error(chalk.red('Error in request.get: ' + error));
        reject(error);
      }

    })

  })

}

function createOptions(access_token, pageToken) {
  if (pageToken) {
    return {
        url: GMAIL_THREADS_URL,
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        qs: {
          maxResults: MAX_RESULTS,
          labelIds: LABEL_IDS,
          pageToken: pageToken
        }
    };
  } else {
    return {
        url: GMAIL_THREADS_URL,
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
    this.results = [];
    this.empty = false;
  }

  getResults() {
    return this.results;
  }

  addToResults(threadId) {
    this.results.push(threadId);
  }
}
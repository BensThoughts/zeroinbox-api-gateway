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

exports.get_threads_ids = function (req, res) {

  let user_info = req.session.user_info;
  let userId = user_info.userId;

  // mongoose.connect(configDB.url, {useNewUrlParser: true});

  // let db = mongoose.connection;

  // db.on('error', console.error.bind(console, 'connection error:'));

  // db.once('open', function() {

    let conditions = { userId: user_info.userId };

    History.findOne(conditions, (err, doc) => {
      if (!doc.passive.firstRun) {
        res.json({ loading_status: false });
      } else {
        let access_token = req.session.token.access_token;
      
        let threadIdsResults = new ThreadIdsResults();
      
        const options = {
          url: 'https://www.googleapis.com/gmail/v1/users/me/threads',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          qs: {
            maxResults: MAX_RESULTS,
            labelIds: LABEL_IDS
          }
        };
      
        let getAllThreadIds = new Promise((resolve, reject) => {
          request.get(options, (error, response, body) => {
      
            if (!error && response.statusCode == 200) {
              body = JSON.parse(body);
      
              if (body.threads) {
                body.threads.forEach((thread) => {
                  let threadId = createThreadId(thread.id, userId);
                  threadIdsResults.addToResults(threadId)
                });
              }
              if (body.nextPageToken) {
                console.log(chalk.yellow('Next Page Token 0: ' + body.nextPageToken));
                  getPages(body.nextPageToken, threadIdsResults, access_token, userId)
                    .then(() => {
                      resolve();
                    }).catch((err) => {
                      console.error(chalk.red(err));
                      reject(err);
                    });
              } else {
                console.log(chalk.yellow('No Next Page Token'));
                resolve();
              }
            } else {
              console.error(chalk.red(error));
              reject(error);
            }
          })
        })
      
      
        getAllThreadIds
          .then(() => {
            conditions = { userId: user_info.userId }
            ThreadId.insertMany(threadIdsResults.getResults(), (err, docs) => {
              if (err) return console.error(chalk.red('Error inserting threadIds: ' + err));
              res.json({ loading_status: true })
            });
          })
          .catch((err) => {
            console.error(chalk.red(err));
            res.status(500).send({ error: 'Request failed with error: ' + err })
          });
      }
    })

   
    
    // })

  }


async function getPages(nextPageToken, threadIdsResults, access_token, userId) {

  let pageCount = 1;

  while (nextPageToken) {

    console.log(chalk.yellow('Next page token ' + (pageCount++) + ': ' + nextPageToken));

    let response = await getPageOfThreads(nextPageToken, access_token).catch((error) => {
      console.error(chalk.red('Error in getPageOfThreads!' + error));
    });

    response.threads.forEach((thread) => {
      let threadId = createThreadId(thread.id, userId);
      threadIdsResults.addToResults(threadId);
    });


    nextPageToken = response.nextPageToken;

  }
}


function getPageOfThreads(pageToken, access_token) {

  let maxResults = 500;

  const options = {
    url: 'https://www.googleapis.com/gmail/v1/users/me/threads',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    qs: {
      maxResults: MAX_RESULTS,
      labelIds: LABEL_IDS,
      pageToken: pageToken
    }
  };

  return new Promise((resolve, reject) => {

    request.get(options, (error, response, body) => {

      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        // console.log('body: ' + body.threads);
        resolve(body)
      } else {
        console.error(chalk.red('Error in request.get: ' + error));
        reject(error);
      }

    })

  })

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
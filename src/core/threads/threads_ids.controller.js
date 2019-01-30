/*******************************************************************************
Get All ThreadIds
*******************************************************************************/

const request = require('request');
const chalk = require('chalk');


// const mongoose = require('mongoose');
const configDB = require('../../config/database');
// const mongodb = require('mongodb');
const mongoose = require('mongoose');

const ThreadIds = require('../models/threadIds.model');

exports.get_threads_ids = function (req, res) {

  let user_info = req.session.user_info;

  mongoose.connect(configDB.url, {useNewUrlParser: true});

  let db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', function() {

    let conditions = { userId: user_info.userId };

    let findPromise = ThreadIds.findOne(conditions);

    findPromise.then((doc) => {
      if (doc !== null) {
          res.json({ threadIds: doc.threadIds })
      } else {

        let access_token = req.session.token.access_token;

        let labelIds = 'INBOX';
      
        let maxResults = 500;
      
        let threadIds = [];
      
        const options = {
          url: 'https://www.googleapis.com/gmail/v1/users/me/threads',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          qs: {
            maxResults: maxResults,
            labelIds: labelIds
          }
        };
      
        let getAllThreadIds = new Promise((resolve, reject) => {
          request.get(options, (error, response, body) => {
      
            if (!error && response.statusCode == 200) {
              body = JSON.parse(body);
              // console.log(body.threads);
      
              if (body.threads) {
                body.threads.forEach((thread) => {
                  threadIds = threadIds.concat(thread.id);
                });
              }
              if (body.nextPageToken) {
                console.log(chalk.yellow('Next Page Token 0: ' + body.nextPageToken));
                  getPages(body.nextPageToken, labelIds, threadIds, access_token)
                    .then(threadIds => {
                      resolve(threadIds);
                    }).catch((err) => {
                      console.error(chalk.red(err));
                      reject(err);
                    });
              } else {
                console.log(chalk.yellow('No Next Page Token'));
                resolve(threadIds);
              }
            } else {
              console.error(chalk.red(error));
              reject(error);
            }
          })
        })
      
      
        getAllThreadIds
          .then((result) => {
            threadIds = new ThreadIds({
              userId: user_info.userId,
              threadIds: result
            })
            threadIds.save((err) => {
              if (err) console.error(chalk.red(err));
            });
            res.send({ threadIds: result });
          })
          .catch((err) => {
            console.error(chalk.red(err));
            res.status(500).send({ error: 'Request failed with error: ' + err })
          });
      }
    })

  })


}


async function getPages(nextPageToken, labelIds, result, access_token) {

  let pageCount = 1;

  while (nextPageToken) {

    console.log(chalk.yellow('Next page token ' + (pageCount++) + ': ' + nextPageToken));

    let response = await getPageOfThreads(nextPageToken, labelIds, access_token).catch((error) => {
      console.error(chalk.red('Error in getPageOfThreads!' + error));
    });

    response.threads.forEach((thread) => {
      result = result.concat(thread.id);
    });


    nextPageToken = response.nextPageToken;

  }
  return result;
}


function getPageOfThreads(pageToken, labelIds, access_token) {

  let maxResults = 500;

  const options = {
    url: 'https://www.googleapis.com/gmail/v1/users/me/threads',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    qs: {
      maxResults: 500,
      labelIds: labelIds,
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

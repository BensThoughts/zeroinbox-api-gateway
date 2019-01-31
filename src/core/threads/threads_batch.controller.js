
/*******************************************************************************
  INIT CHALK
*******************************************************************************/
const chalk = require('chalk');
const request = require('request');

/*******************************************************************************
 HASHING INIT
*******************************************************************************/
const crypto = require('crypto');

/*******************************************************************************
 MONGOOSE INIT
*******************************************************************************/
const configDB = require('../../config/database');
const mongoose = require('mongoose');

const Suggestion = require('../models/suggestion.model');
const History = require('../models/history.model');
const ThreadIds = require('../models/thread_IDs.model');

/*******************************************************************************
 BATCHELOR INIT
*******************************************************************************/
const Batchelor = require('batchelor');

/******************************************************************************
  GAPI BATCH REQUEST TO GET EACH THREAD
  https://developers.google.com/gmail/api/v1/reference/users/threads/get
  https://github.com/wapisasa/batchelor
******************************************************************************/

/**
 * Given an array of threadIds this endpoint will batch request all metadata
 *  from each thread in batches of BATCH_SIZE
 *
 *  Accepts request of type:
 *    GapiRequest {
 *      body: {
 *        threadIds: Array<string>;
 *      }
 *    }
 *
 * @type {Array}
 */




const GMAIL_BATCH_ENDPOINT = 'https://www.googleapis.com/batch/gmail/v1';
const BATCH_SIZE = 100;



/**
 * An implementation of asyncForEach such that each run of a batchelor request
 * waits for the previous request to finish before executing itself...much like
 * concatMap from rxjs.
 *
 * @param  {Array<Array<T>>}   array    An array of sub arrays
 * @param  {Function}          callback The callback function
 * @return {void}              does not return, is used internally as above
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Given an array, this function will return Array<Array<T>> where each
 *  subArray is of length subarraySize except for the last array which will
 *  be of length (array.length % subarraySize). Given an array with length
 *  less than subarraySize a new array of length 1 Array<Array<T>> with an inner
 *  array of length same as the starting array is returned.
 *
 * Result should always start as the empty array [] but will become Array<Array<T>>
 *  as recursion happens.
 *
 * @param  {Array<T>} array        The array to be split;
 * @param  {Array<T>} result       The result as it currently exists;
 * @return {Array<Array<T>>}       The result after the last subArray is added;
 */

function chunkThreadIds(array, result) {

  if (array.length <= BATCH_SIZE) {
    result = result.concat([array]);
    return result;
  }

  result = result.concat([array.slice(0, BATCH_SIZE)]);
  array = array.slice(BATCH_SIZE);

  return chunkThreadIds(array, result);

}

/**
 * Create a new Batchelor Batch Request from one of the subArrays of threadIds.
 *  creates the batch request with 'format=metadata'
 *
 * @param  {Array<string>} subArray     Array of threadIds
 * @param  {string} access_token        The users google access_token
 * @return {Promise}                    The actual batch request to be executed
 */

function newBatchThreadRequest(threadIdsChunk, access_token) {
  var batch = new Batchelor({
    'uri': GMAIL_BATCH_ENDPOINT,
    'method': 'POST',
    'headers': {
      'Content-Type': 'multipart/mixed',
      'Authorization': 'Bearer ' + access_token
    }
  });

  let query = '?format=metadata ';

  threadIdsChunk.forEach((threadId) => {
    batch.add({
      'method': 'GET',
      'path': '/gmail/v1/users/me/threads/' + threadId + query,
    });
  });

  return new Promise((resolve, reject) => {
    batch.run((err, response) => {
      if (err) {
        console.error(chalk.red("Error: " + err));
        reject(err);
      } else {
        //results = results.concat([response]);
        resolve(response);
      }
    });
  });
}

function checkPartBatchResponse(part_batch_response) {
  try {
    if (part_batch_response.body === undefined) {
      throw new Error('part_batch_response.body undefined!');
    };
    if (part_batch_response.body.messages === undefined) {
      throw new Error('part_batch_response.body.messages undefined!');
    }
    if (part_batch_response.body.messages[0] === undefined) {
      throw new Error('part_batch_response.body.messages[0] undefined!');
    }
    if (part_batch_response.body.messages[0].threadId === undefined) {
      throw new Error('part_batch_response.body.messages[0].threadId undefined!');
    }
    if (part_batch_response.body.messages[0].internalDate === undefined) {
      throw new Error('part_batch_response.body.messages[0].internalDate undefined!');
    }
    if (part_batch_response.body.messages[0].labelIds === undefined) {
      throw new Error('part_batch_response.body.messages[0].labelIds undefined!');
    }
    if (part_batch_response.body.messages[0].sizeEstimate === undefined) {
      throw new Error('part_batch_response.body.messages[0].sizeEstimate undefined!');
    }
    if (part_batch_response.body.messages[0].payload === undefined) {
      throw new Error('part_batch_response.body.messages[0].payload undefined!');
    }
    if (part_batch_response.body.messages[0].payload.headers === undefined) {
      throw new Error('part_batch_response.body.messages[0].payload.headers undefined!');
    }
    // console.log(chalk.green('part_batch_response OK!'));
    return true;
  } catch(err) {
    console.error(chalk.red('Error in part_batch_response: ' + err));
    return false;
  }
}

function extractNameAndAddress(headers) {
  let fromAddress, fromName, id;
  let return_headers = undefined;
  // console.log(headers);
  // headers.forEach((header) => {
  try {

  for (let header of headers) {
    if (header.name === 'From' || header.name === 'from') {
      if (header.name === 'from') {
        console.log(chalk.blue.bold(`Header is in 'from' form instead of 'From': `) + chalk.cyan(`"${header.value}"`));
      }
      if (header.value.search('<+') !== -1) {
        fromAddress = header.value.slice(header.value.search('<+')+1, -1);
        fromName = header.value.slice(0, header.value.search('<+')-1);
      } else {
        console.log(chalk.blue(`'From' or 'from' defined as "name@address.com": `) + chalk.cyan(`"${header.value}"`));
        fromAddress = header.value;
        fromName = header.value.slice(0, header.value.search('@'));
      }

      if (fromName.search('"') === 0) {
        fromName = fromName.slice(1,-1);
      }
      if (fromAddress.search('"') === 0) {
        fromAddress = fromAddress.slice(1,-1);
      }

      let md5sum = crypto.createHash('md5');
      md5sum.update(fromAddress);

      id = md5sum.digest('hex');

      return_headers = { fromAddress: fromAddress, fromName: fromName, id: id };
      break;
    }

  }; // headers.ForEach()
  
  if (return_headers === undefined) {
    throw new Error('From or from not found in headers!');
  } else {
    return return_headers;
  }

  } catch (err) {
    console.error(chalk.red(err));
  }
}

function extractMetaData(message) {

  let headers = extractNameAndAddress(message.payload.headers);

  let threadId_internalDate = {
    threadId: message.threadId,
    internalDate: message.internalDate
  }
  let messageMetaData = {
    id: headers.id,
    fromAddress: headers.fromAddress,
    fromName: headers.fromName,

    threadId_internalDate: threadId_internalDate,
    labelIds: message.labelIds,
    sizeEstimate: message.sizeEstimate,
    // headers: part_batch_response.body.messages[0].payload.headers
  }

  return messageMetaData;
}

function createSuggestion(message, user_info) {
  let senderMetaData = extractMetaData(message);
  let suggestion = new Suggestion({
    userId: user_info.userId,
    emailAddress: user_info.emailAddress,
    emailId: user_info.emailId,
    senderId: senderMetaData.id,
    sender: {
      id: senderMetaData.id,
      fromNames: [senderMetaData.fromName],
      fromAddress: senderMetaData.fromAddress,
      threadIds_internalDates: [senderMetaData.threadId_internalDate],
      totalSizeEstimate: senderMetaData.sizeEstimate,
      count: 1
    }
  })
  return suggestion;
}

class Results {

  constructor() {
    this.results = []; // an array of Suggestions
    this.empty = true;
  }

  addToResults(new_suggestion) {
    let found = false;
    if (this.empty) {
      this.results.push(new_suggestion);
      this.empty = false;
    } else {
      for (let i = 0; i < this.results.length; i++) {
        if (this.results[i].senderId === new_suggestion.senderId) {
          this.mergeSuggestion(this.results[i], new_suggestion);
          found = true;
          break;
        }
      }
      if (!found) {
        this.results.push(new_suggestion);
      }
    }
  }

  getResults() {
    return this.results;
  }

  // Private
  mergeSuggestion(previous_suggestion, new_suggestion) {
    let found_same_name = false;
    previous_suggestion.sender.fromNames.forEach((name) => {
      if (name === new_suggestion.sender.fromNames[0]) {
        found_same_name = true;
      }
    });
    if (!found_same_name) {
      previous_suggestion.sender.concatNames(new_suggestion.sender.fromNames);
    }
    
    previous_suggestion.sender.concatThreadIds_internalDates(new_suggestion.sender.threadIds_internalDates);
    previous_suggestion.sender.addOneToCount();
    previous_suggestion.sender.addToTotalSizeEstimate(new_suggestion.sender.totalSizeEstimate);
  }

}

exports.threads_batch = function (req, res) {

  let access_token = req.session.token.access_token;
  let user_info = req.session.user_info;
  let alreadyInDb = false;

  let conditions = { userId: user_info.userId };

  History.findOne(conditions, (err, doc) => {
    if (err) return console.error(chalk.red('Error in History.findOne: ' + err));
    // console.log(doc);
    if (doc.passive.firstRun === false) {
      res.json({ loading_status: false })
    } else {
 
      let update = {
        "active.loadingStatus": true
      };
      let options = {
        multi: false,
        upsert: true
      };

      History.updateOne(conditions, update, options, (err, raw) => {
        if(err) return console.error(chalk.red('Error in History.updateOne: attempt to change loading to true' + err));
        console.log(chalk.blue.bold('History: Active: Loading set to true'));

        // wait until we update loading status then client can
        // start polling for loading
        res.json({ loading_status: true }); 
      });

      ThreadIds.find().distinct('threadId', conditions, (err, threadIds) => {
        if (err) return console.error(chalk.red('Error in ThreadIds.find().distinct(): ' + err));
        const startBatchProccess = async () => {
  
          let inter_response_count = 0;

          let newResults = new Results();

          let threadIdChunks = chunkThreadIds(threadIds, []);

          await asyncForEach(threadIdChunks, async (threadIdsChunk) => {
            let batchResult = await newBatchThreadRequest(threadIdsChunk, access_token);
            console.log(chalk.yellow('Inter response done: ' + inter_response_count++));

            if (batchResult.parts !== undefined) {

              batchResult.parts.forEach((part_batch_response) => {
                if (checkPartBatchResponse(part_batch_response)) {
                  let newSuggestion = createSuggestion(part_batch_response.body.messages[0], user_info);
                  newResults.addToResults(newSuggestion);
                  newSuggestion = undefined;
                }
              });

            } else {
              console.error('result.parts was undefined!');
            }
            batchResult = undefined;
          });

          Suggestion.insertMany(newResults.getResults(), (err, docs) => {
            if (err) return console.error(chalk.red('Error in Suggestion.insertMany(): ' + err));
            console.log(chalk.blue.bold('Suggestions inserted'));
            conditions = { userId: user_info.userId }
            update = {
              // userId: user_info.userId,
              "active.loadingStatus": false,
              "passive.firstRun": false
            };
            options = {
              multi: false,
              upsert: true
            };
    
            // change loading status only after the insert is done
            History.updateOne(conditions, update, options, (err, raw) => {
              if(err) return console.error(chalk.red('Error in History.updateOne: attempt to change loading to false' + err));
              console.log(chalk.blue.bold('History: Active: Loading: set to false'));
            });
          });
          console.log('DONE')
        }
        startBatchProccess().catch((error) => {
          console.log(error);
          res.status(500).send('Error in startBatchProccess(): ' + error);
        });

      }) // ThreadIds.find()

    } // else

  }); // History.findOne()

}


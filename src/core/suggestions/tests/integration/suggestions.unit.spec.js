const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
let mongoServer;

const suggestionsController = require('../../suggestions.controller');
const Suggestions = require('../../../../models/sender.model');

const chai = require('chai');
const expect = chai.expect;

let httpMocks = require('node-mocks-http');

function getRequest() {
    return httpMocks.createRequest({
        method: 'GET',
        url: '/v1/basicProfile',
        session: {
            token: {
                access_token: 'test_token',
                expiry_date: '1551501417831',
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
                token_type: 'Bearer'
            },
            user_info: {
                userId: '12345abc',
                emailId: '54321cba',
                emailAddress: 'test@gmail.com'
            }
        },
        headers: {
            cookie: 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF'
        }
    });
} 

function getResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

describe('suggestionsController:', () => {

    describe('suggestions: ', () => {
        before((done) => {
            let opts = { useNewUrlParser: true };
            mongoServer = new MongoMemoryServer();
            mongoServer.getConnectionString().then((mongoUri) => {
                return mongoose.connect(mongoUri, opts, (err) => {
                    if (err) done(err);
                });
            }).then(() => done());
        });
        before((done) => {
            let request = getRequest();
            let userId = request.session.user_info.userId;
            let conditions1 = { userId: userId, senderId: 'senderId' };
            let conditions2 = { userId: userId, senderId: 'senderId2'};
            let conditions3 = { userId: userId, senderId: 'senderId3' };
            let condistions4 = { userId: 'userId2', senderId: 'senderId' };
            let options = {
                multi: false,
                upsert: true
              }
            let update1 = {
                '$set': {
                    userId: userId, 
                    senderId: 'senderId',
                    senderAddress: 'test@gmail.com'
                },
                '$inc': {
                    totalSizeEstimate: 100,
                    count: 10
                },
                '$push': {
                    threadIds_internalDates: [
                        { threadId: 'id1', internalDate: 123456 },
                        { threadId: 'id1', internalDate: 1234565 }
                    ],
                },
                '$addToSet': {
                    senderNames: ['testName1', 'testName2']
                }
            }
            let update2 = {
                '$set': {
                    userId: userId, 
                    senderId: 'senderId2',
                    senderAddress: 'test2@gmail.com'
                },
                '$inc': {
                    totalSizeEstimate: 100,
                    count: 10
                },
                '$push': {
                    threadIds_internalDates: [
                        { threadId: 'id2', internalDate: 123456 },
                        { threadId: 'id2', internalDate: 1234565 }
                    ],
                },
                '$addToSet': {
                    senderNames: ['testName3', 'testName4']
                }
            }
            let update3 = {
                '$set': {
                    userId: userId, 
                    senderId: 'senderId3',
                    senderAddress: 'test3@gmail.com'
                },
                '$inc': {
                    totalSizeEstimate: 100,
                    count: 10
                },
                '$push': {
                    threadIds_internalDates: [
                        { threadId: 'id3', internalDate: 123456 },
                        { threadId: 'id3', internalDate: 1234565 }
                    ],
                },
                '$addToSet': {
                    senderNames: ['testName5', 'testName6']
                }
            }
            let update4 = {
                '$set': {
                    userId: 'userId2', 
                    senderId: 'senderId',
                    senderAddress: 'test3@gmail.com'
                },
                '$inc': {
                    totalSizeEstimate: 100,
                    count: 10
                },
                '$push': {
                    threadIds_internalDates: [
                        { threadId: 'id4', internalDate: 123456 },
                        { threadId: 'id4', internalDate: 1234565 }
                    ],
                },
                '$addToSet': {
                    senderNames: ['testName7', 'testName8']
                }
            }
            Suggestions.updateOne(conditions1, update1, options, (err, doc) => {
                Suggestions.updateOne(conditions2, update2, options, (err2, doc2) => {
                    Suggestions.updateOne(conditions3, update3, options, () => {
                        Suggestions.updateOne(condistions4, update4, options, () => {
                            done();
                        });
                    });
                });
            });
        });
        after(() => {
            mongoose.disconnect();
            mongoServer.stop();
        });
        describe('returns a set of suggestions', () => {
            it('returns success/ok', (done) => {
                let request = getRequest();
                let response = getResponse();
                suggestionsController.suggestions(request, response);
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    done();
                });
            });
            it('returns the right number of suggestions', (done) => {
                let request = getRequest();
                let response = getResponse();
                suggestionsController.suggestions(request, response);
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    let suggestions = data.data.suggestions;
                    expect(suggestions.length).to.eql(3);
                    done();
                });
            });
        });
    });
});
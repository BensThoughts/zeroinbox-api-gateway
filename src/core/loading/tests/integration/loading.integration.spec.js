const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
let mongoServer;

const sinon = require('sinon');


// const loadingController = require('../../loading.controller');


const chai = require('chai');
const expect = chai.expect;

let httpMocks = require('node-mocks-http');

const History = require('../../../../models/history.model');

function getRequest() {
    return httpMocks.createRequest({
        method: 'GET',
        url: '/v1/basicProfile',
        session: {
            token: {
                accessToken: 'test_token',
                expiryDate: '1551501417831',
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
                tokenType: 'Bearer'
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

const rewire = require('rewire');
const loadingController = rewire('../../loading.controller');


describe('loadingController:', () => {

    describe('first_run_status: ', () => {
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
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            let options = {
                multi: false,
                upsert: true
              }
            let activeUpdate = {
                "active.session.cookie": request.headers.cookie,
                "active.session.accessToken": request.session.token.accessToken,
                "active.session.expiryDate": request.session.token.expiryDate,
                "active.session.scope": request.session.token.scope,
                "active.session.tokenType": request.session.token.tokenType,
            }
            History.updateOne(conditions, activeUpdate, options, () => {
                done();
            });
        });
        after(() => {
            mongoose.disconnect();
            mongoServer.stop();
        });
        it('should return firstRun: true if it is not already set in History', (done) => {
            let request = getRequest();
            let response = getResponse();
            let userId = request.session.userInfo.userId;
            // activeUpdate has already been applied if this route is being called
            // there are checks for this in route-errors, so we set it here first.

            loadingController.first_run_status(request, response);
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('success');
                expect(data.status_message).to.eql('OK');
                expect(data.data.firstRun).to.eql(true);
                done();
            });
        });
        it('should have set firstRun: true in History if it is not already set', (done) => {
            let request = getRequest();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            History.findOne(conditions, (err, doc) => {
                expect(doc.passive.firstRun).to.eql(true);
                done();
            });
        });
        it('should have set firstRunDate to a new Date object', (done) => {
            let request = getRequest();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            History.findOne(conditions, (err, doc) => {
                let date = new Date();
                expect(doc.passive.firstRunDate).to.be.below(date);
                done();
            });
        });
        it('should have set lastRunDate to a new Date object', (done) => {
            let request = getRequest();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            History.findOne(conditions, (err, doc) => {
                let date = new Date();
                expect(doc.passive.lastRunDate).to.be.below(date);
                done();
            });
        });
        it('should return firstRun as doc.passive.firstRun if it is already set in History', (done) => {
            let request = getRequest();
            let response = getResponse();
            let userId = request.session.userInfo.userId;
            // activeUpdate has already been applied if this route is being called
            // there are checks for this in route-errors, so we set it here first.
            loadingController.first_run_status(request, response);
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('success');
                expect(data.status_message).to.eql('OK');
                expect(data.data.firstRun).to.eql(true);
                done();
            });
        });
        it('should have a lastRunDate that is greater then the firstRunDate after being called again', (done) => {
            let request = getRequest();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            History.findOne(conditions, (err, doc) => {
                expect(doc.passive.lastRunDate).to.be.above(doc.passive.firstRunDate);
                done();
            });
        });
        it('should return firstRun as false after first run has been set to false in History', (done) => {
            let request = getRequest();
            let response = getResponse();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            let options = {
                multi: false,
                upsert: true
              }
            let activeUpdate = {
                "passive.firstRun": false,
            }
            History.updateOne(conditions, activeUpdate, options, () => {
                loadingController.first_run_status(request, response);
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(data.data.firstRun).to.eql(false);
                    done();
                });
            });
        });

    });

    describe('load_suggestions:', () => {
        let revert;
        let stubGetPublishUser;
        beforeEach((done) => {
            const getPublishUserFunc = { getPublishUser: loadingController.__get__('publishUser') };
            stubGetPublishUser = sinon.stub(getPublishUserFunc, 'getPublishUser').returns(true);
            // let publishUser = testdouble.replace(getPublishUserFunc);
            // publishUser.
            revert = loadingController.__set__('publishUser', stubGetPublishUser);
            let opts = { useNewUrlParser: true };
            mongoServer = new MongoMemoryServer();
            mongoServer.getConnectionString().then((mongoUri) => {
                return mongoose.connect(mongoUri, opts, (err) => {
                    if (err) done(err);
                });
            }).then(() => done());
        });
        beforeEach((done) => {
            let request = getRequest();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            let options = {
                multi: false,
                upsert: true
              }
            let activeUpdate = {
                "active.session.cookie": request.headers.cookie,
                "active.session.accessToken": request.session.token.accessToken,
                "active.session.expiryDate": request.session.token.expiryDate,
                "active.session.scope": request.session.token.scope,
                "active.session.tokenType": request.session.token.tokenType,
            }
            History.updateOne(conditions, activeUpdate, options, () => {
                done();
            });
        });
        afterEach(() => {
            mongoose.disconnect();
            mongoServer.stop();
            revert();
        });
        it('should return success/OK the first time called', (done) => {
            let request = getRequest();
            let response = getResponse();
            loadingController.load_suggestions(request, response);
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('success');
                expect(data.status_message).to.eql('OK');
                done();
            });
        });
        it('should only call publishUser once', (done) => {
            let request = getRequest();
            let response = getResponse();
            loadingController.load_suggestions(request, response);
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(stubGetPublishUser.calledOnce).to.be.true;
                done();
            });
        });
        it('should not call publishUser if loading is still true', (done) => {
            let request = getRequest();
            let response = getResponse();
            let request2 = getRequest();
            let response2 = getResponse();
            loadingController.load_suggestions(request, response);
            response.on('end', () => {
                loadingController.load_suggestions(request2, response2);
                response2.on('end', () => {
                    let data = JSON.parse(response2._getData());
                    expect(stubGetPublishUser.calledOnce).to.be.true;
                    done();
                });
            });
        });
        it('should skip to status message Already Loading if it is still loading suggestions', (done) => {
            let request = getRequest();
            let response = getResponse();
            let request2 = getRequest();
            let response2 = getResponse();
            loadingController.load_suggestions(request, response);
            response.on('end', () => {
                loadingController.load_suggestions(request2, response2);
                response2.on('end', () => {
                    let data = JSON.parse(response2._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('Already Loading');
                    done();
                });
            });
        });
        it('should set loading to true before sending the response', (done) => { 
            let request = getRequest();
            let response = getResponse();
            let conditions = { userId: request.session.userInfo.userId };
            loadingController.load_suggestions(request, response);
            response.on('end', () => {
                History.findOne(conditions, (err, doc) => {
                    expect(doc.active.loadingStatus).to.eql(true);
                    expect(doc.active.percentLoaded).to.eql(5);
                    done();
                });
            });
        });
    });

    describe('loading_status:', () => {
        let request;
        let response;
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
            request = getRequest();
            let userId = request.session.userInfo.userId;
            let conditions = { userId: userId };
            let options = {
                multi: false,
                upsert: true
              }
            let activeUpdate = {
                "active.session.cookie": request.headers.cookie,
                "active.session.accessToken": request.session.token.accessToken,
                "active.session.expiryDate": request.session.token.expiryDate,
                "active.session.scope": request.session.token.scope,
                "active.session.tokenType": request.session.token.tokenType,
                "active.loadingStatus": true,
                "active.percentLoaded": 5,
            }
            History.updateOne(conditions, activeUpdate, options, () => {
                done();
            });
        });
        beforeEach((done) => {
            request = getRequest();
            response = getResponse();
            loadingController.loading_status(request, response);
            response.on('end', () => {
                done();
            });
        });
        after(() => {
            mongoose.disconnect();
            mongoServer.stop();
        });
        it('should respond with the loadingStatus', () => {
            let data = JSON.parse(response._getData());
            expect(data.status).to.eql('success');
            expect(data.status_message).to.eql('OK');
            expect(data.data.loadingStatus).to.eql(true);
            expect(data.data.percentLoaded).to.eql(5);
        });
        it('should see a change in loadingStatus/percentLoaded if status is changed', (done) => {
            let conditions = { userId: request.session.userInfo.userId }
            let update = {
                "active.loadingStatus": false,
                "active.percentLoaded": 10
            }
            let options = {
                upsert: true,
                multi: false,
            }
            History.updateOne(conditions, update, options, (err, doc) => {
                let request2 = getRequest();
                let response2 = getResponse();
                loadingController.loading_status(request2, response2);
                response2.on('end', () => {
                    let data = JSON.parse(response2._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(data.data.loadingStatus).to.eql(false);
                    expect(data.data.percentLoaded).to.eql(10);
                    done();
                });
            });
        });
    
    });

});
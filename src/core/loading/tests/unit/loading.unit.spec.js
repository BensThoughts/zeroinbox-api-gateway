const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const {
    DEFAULT_PERCENT_LOADED
} = require('../../../../config/init.config');

const chai = require('chai');
const expect = chai.expect;

let httpMocks = require('node-mocks-http');
const td = require('testdouble');

const userId = 'user_id';

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
                userId: userId,
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

let loadingController; // = require('../../loading.controller');
let upsertToHistory;
let findOneHistory;
let publishUser;

describe('loadingController:', () => {


    describe('first_run_status(req, res): ', () => {

        beforeEach(() => {
            let mongooseUtils = td.replace('../../../../libs/utils/mongoose.utils');
            upsertToHistory = mongooseUtils.upsertToHistory;
            findOneHistory = mongooseUtils.findOneHistory;
            loadingController = require('../../loading.controller');
        });
        afterEach(() => {
            td.reset();
            loadingController = undefined;
        });
        describe('Success paths: ', () => {
            it('should return firstRun: true if it is not already set in History', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, null);
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(response._getStatusCode()).to.eql(200);
                    expect(data.data.firstRun).to.eql(true);
                    done();
                });
                loadingController.first_run_status(request, response);
            });
            it('should return firstRun: false if it is set in History DB to false', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, {
                    passive: {
                        firstRun: false
                    }
                });
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(response._getStatusCode()).to.eql(200);
                    expect(data.data.firstRun).to.eql(false);
                    done();
                });
                loadingController.first_run_status(request, response);
            });
            it('should return firsRun: true if it is set in History DB to true', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, {
                    passive: {
                        firstRun: true
                    }
                });
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(response._getStatusCode()).to.eql(200);
                    expect(data.data.firstRun).to.eql(true);
                    done();
                });
                loadingController.first_run_status(request, response);
            });
            it('should call upsertToHistory() with the proper arguments on firstRunEver', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, null);
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let explanation = td.explain(upsertToHistory);
                    expect(explanation.callCount).to.eql(1);
                    expect(explanation.calls[0].args[0]).to.eql(userId);
                    expect(explanation.calls[0].args[1]['passive.firstRun']).to.eql(true);
                    expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.be.a('Date');
                    let lastRunDate = explanation.calls[0].args[1]['passive.lastRunDate'];
                    expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.eql(lastRunDate);
                    done();
                });
                loadingController.first_run_status(request, response); 
            });
            it('should call upsertToHistory() with the proper arguments on run where firstRun is false', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, {
                    passive: {
                        firstRun: false,
                        firstRunDate: new Date(),
                        lastRunDate: new Date()
                    }
                });
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let explanation = td.explain(upsertToHistory);
                    expect(explanation.callCount).to.eql(1);
                    expect(explanation.calls[0].args[0]).to.eql(userId);
                    expect(explanation.calls[0].args[1]['passive.firstRun']).to.not.exist;
                    expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.not.exist;
                    expect(explanation.calls[0].args[1]['passive.lastRunDate']).to.be.a('Date');
                    done();
                });
                loadingController.first_run_status(request, response); 
            });
            it('should call upsertToHistory() with the proper arguments on run where firstRun is true', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, {
                    passive: {
                        firstRun: true,
                        firstRunDate: new Date(),
                        lastRunDate: new Date()
                    }
                });
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let explanation = td.explain(upsertToHistory);
                    expect(explanation.callCount).to.eql(1);
                    expect(explanation.calls[0].args[0]).to.eql(userId);
                    expect(explanation.calls[0].args[1]['passive.firstRun']).to.not.exist;
                    expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.not.exist;
                    expect(explanation.calls[0].args[1]['passive.lastRunDate']).to.be.a('Date');
                    done();
                });
                loadingController.first_run_status(request, response); 
            });
        });

        describe('Error paths: ', () => {
            it('should respond with a 500 error message if the DB find throws an error', (done) => {
                td.when(findOneHistory(userId), { times: 1 }).thenCallback('Error', null);
                let request = getRequest();
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(data.status_message).to.exist;
                    expect(response._getStatusCode()).to.eql(500);
                    done();
                });
                loadingController.first_run_status(request, response); 
            });
        });
    });

    describe('loading_status(req, res): ', () => {
        beforeEach(() => {
            let mongooseUtils = td.replace('../../../../libs/utils/mongoose.utils');
            upsertToHistory = mongooseUtils.upsertToHistory;
            findOneHistory = mongooseUtils.findOneHistory;
            loadingController = require('../../loading.controller');
        });
        afterEach(() => {
            td.reset();
            loadingController = undefined;
        });
        describe('Error paths: ', () => {
            it('should respond with a 400 error message if there is no doc yet in db', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId)).thenCallback(null, null);
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(data.status_message).to.exist;
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                loadingController.loading_status(request, response);
            });
            it('should respond with a 400 error message if active is not set yet in db', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId)).thenCallback(null, {
                    passive: {
                        firstRun: true,
                        firstRunDate: new Date(),
                        lastRunDate: new Date()
                    }
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(data.status_message).to.exist;
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                loadingController.loading_status(request, response);
            });
            it('should respond with a 400 error message if active is set but loadingStatus is not yet in db', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId)).thenCallback(null, {
                    active: {
                        session: {
                            test: 'test'
                        },
                        percentLoaded: 10
                    },
                    passive: {
                        firstRun: true,
                        firstRunDate: new Date(),
                        lastRunDate: new Date()
                    }
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(data.status_message).to.exist;
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                loadingController.loading_status(request, response);
            });
            it('should respond with a 400 error message if active is set but percentLoaded is not yet in db', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId)).thenCallback(null, {
                    active: {
                        session: {
                            test: 'test'
                        },
                        loadingStatus: true
                    },
                    passive: {
                        firstRun: true,
                        firstRunDate: new Date(),
                        lastRunDate: new Date()
                    }
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(data.status_message).to.exist;
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                loadingController.loading_status(request, response);
            });
            it('should respond with a 500 error message if the db returns an error', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId)).thenCallback('Error', null);
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(data.status_message).to.exist;
                    expect(response._getStatusCode()).to.eql(500);
                    done();
                });
                loadingController.loading_status(request, response);
            });
        });
        describe('Success paths: ', () => {
            it('should respond with the correct loadingStatus and percentLoaded', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId)).thenCallback(null, {
                    active: {
                        loadingStatus: true,
                        percentLoaded: 10
                    }
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(response._getStatusCode()).to.eql(200);
                    expect(data.data.loadingStatus).to.eql(true);
                    expect(data.data.percentLoaded).to.eql(10);
                    done();
                });
                loadingController.loading_status(request, response);
            });
        });
    });
    describe('loading_suggestions(req, res): ', () => {
        beforeEach(() => {
            let mongooseUtils = td.replace('../../../../libs/utils/mongoose.utils');
            upsertToHistory = mongooseUtils.upsertToHistory;
            findOneHistory = mongooseUtils.findOneHistory;
            let rabbitUtils = td.replace('../../../../libs/utils/rabbit.utils');
            publishUser = rabbitUtils.publishUser;
            loadingController = require('../../loading.controller');
        });
        afterEach(() => {
            td.reset();
            loadingController = undefined;
        });
        describe('Success paths: ', () => {
            it('should respond with the proper response on a users firstRunEver', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, null);
                let update = {
                    'active.loadingStatus': true,
                    'active.percentLoaded': DEFAULT_PERCENT_LOADED
                  }
                td.when(upsertToHistory(userId, update), { times: 1 }).thenCallback(null, {
                    n: 1,
                    nModified: 1, 
                    ok: 1
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(response._getStatusCode()).to.eql(200);
                    let upsertExplanation = td.explain(upsertToHistory);
                    let publishExplanation = td.explain(publishUser);
                    expect(upsertExplanation.callCount).to.eql(1);
                    expect(publishExplanation.callCount).to.eql(1);
                    done();
                });
                loadingController.load_suggestions(request, response);
            });
            it('should respond with the proper response on a users next run when loadingStatus is true', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, {
                    active: {
                        loadingStatus: true,
                        percentLoaded: 10
                    }
                });
                let update = {
                    'active.loadingStatus': true,
                    'active.percentLoaded': DEFAULT_PERCENT_LOADED
                  }
                td.when(upsertToHistory(userId, update), { times: 1 }).thenCallback(null, {
                    n: 1,
                    nModified: 1, 
                    ok: 1
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    // console.log(data);
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('Already Loading');
                    expect(response._getStatusCode()).to.eql(200);
                    let upsertExplanation = td.explain(upsertToHistory);
                    let publishExplanation = td.explain(publishUser);
                    expect(publishExplanation.callCount).to.eql(0);
                    expect(upsertExplanation.callCount).to.eql(0);
                    done();
                });
                loadingController.load_suggestions(request, response);
            });
            it('should respond with the proper response on a users next run when loadingStatus is false', (done) => {
                let request = getRequest();
                let response = getResponse();
                td.when(findOneHistory(userId), { times: 1 }).thenCallback(null, {
                    active: {
                        loadingStatus: false,
                        percentLoaded: 100
                    }
                });
                let update = {
                    'active.loadingStatus': true,
                    'active.percentLoaded': DEFAULT_PERCENT_LOADED
                  }
                td.when(upsertToHistory(userId, update), { times: 1 }).thenCallback(null, {
                    n: 1,
                    nModified: 1, 
                    ok: 1
                });
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    // console.log(data);
                    expect(data.status).to.eql('success');
                    expect(data.status_message).to.eql('OK');
                    expect(response._getStatusCode()).to.eql(200);
                    let upsertExplanation = td.explain(upsertToHistory);
                    let publishExplanation = td.explain(publishUser);
                    expect(publishExplanation.callCount).to.eql(1);
                    expect(upsertExplanation.callCount).to.eql(1);
                    done();
                });
                loadingController.load_suggestions(request, response);
            });
        });

    
    });

});

const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const chai = require('chai');
const expect = chai.expect;
const td = require('testdouble');

let httpMocks = require('node-mocks-http');

const userId = 'user_id';
const emailId = 'email_id';
const emailAddress = 'test@gmail.com';
const token = {
    access_token: 'test_token',
    expiry_date: '1551501417831',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    token_type: 'Bearer'
}

const cookie = 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF';

function getRequest(body) {
    return httpMocks.createRequest({
        method: 'GET',
        url: '/v1/stats',
        session: {
            token: token,
            user_info: {
                userId: userId,
                emailId: emailId,
                emailAddress: emailAddress
            }
        },
        headers: {
            cookie: cookie
        },
        body: {
            ...body
        }
    });
} 

function getResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

describe('actionsController: ', () => {
    describe('postActions: ', () => {
        let actionsController;
        let rabbitUtils;
        beforeEach(() => {
            rabbitUtils = td.replace('../../../../libs/utils/rabbit.utils');
            actionsController = require('../../actions.controller');
        });
        afterEach(() => {

        });
        describe('Success responses', () => {
            it('should give a response if label is set in body', (done) => {
                let body = {
                    label: ['senderId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(response._getStatusCode()).to.eql(200);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should give a response if filter is set in body', (done) => {
                let body = {
                    filter: ['senderId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(response._getStatusCode()).to.eql(200);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should give a response if delete is set in body', (done) => {
                let body = {
                    delete: ['senderId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('success');
                    expect(response._getStatusCode()).to.eql(200);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should call publishAction once with the correct args', (done) => {

                let body = {
                    delete: ['senderIdd1', 'senderIdd2', 'senderIdd3'],
                    label: ['senderIdl1', 'senderIdl2', 'senderIdl3'],
                    filter: ['senderIdf1', 'senderIdf2', 'senderIdf3']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let explanation = td.explain(rabbitUtils.publishActions);
                    expect(explanation.callCount).to.eql(1);
                    expect(explanation.calls[0].args[0]).to.eql(userId);
                    expect(explanation.calls[0].args[1]).to.eql(body);
                    done();
                });
                actionsController.postActions(request, response);
            });
        });
        describe('Error responses: ', () => {
            it('should give an error if the body is empty or contains none of the valid arrays', (done) => {
                let body = {
                    invalidData: ['threadId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should give an error if the data in label is not an array', (done) => {
                let body = {
                    label: 'threadId1',
                    filter: ['threadId1'],
                    delete: ['threadId2']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should give an error if the data in filter is not an array', (done) => {
                let body = {
                    label: ['threadId1'],
                    filter: {
                        'threads': ['threadId1']
                    },
                    delete: ['threadId2']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should give an error if the data in delete is not an array', (done) => {
                let body = {
                    label: ['threadId1'],
                    filter: ['threadId1'],
                    delete: 12345
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                actionsController.postActions(request, response);
            });
            it('should give an error if a threadId in delete is also in label', (done) => {
                let body = {
                    label: ['threadIdl1', 'threadIdl2', 'threadIdl3', 'threadIdl4'],
                    filter: ['threadIdf1', 'threadIdf2', 'threadIdf3', 'threadIdf4'],
                    delete: ['threadIdl1', 'threadIdd2', 'threadIdd3', 'threadIdd4']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                actionsController.postActions(request, response);                
            });
            it('should give an error if a threadId in delete is also in filter', (done) => {
                let body = {
                    label: ['threadIdl1', 'threadIdl2', 'threadIdl3', 'threadIdl4'],
                    filter: ['threadIdf1', 'threadIdf2', 'threadIdf3', 'threadIdf4'],
                    delete: ['threadId21', 'threadIdf2', 'threadIdd3', 'threadIdd4']
                }
                let request = getRequest(body);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                actionsController.postActions(request, response);                
            });
        });
    });
});
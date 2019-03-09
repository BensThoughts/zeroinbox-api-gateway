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
        method: 'POST',
        path: '/v1/actions',
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

describe('actionsPostErrors: ', () => {
        let actionsPostErrors;
        beforeEach(() => {
            actionsPostErrors = require('../../action-post-errors');
        });
        afterEach(() => {

        });
        describe('Success responses', () => {
            it('should call next if label is set in body', (done) => {
                let body = {
                    label: ['senderId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                let nextCalled = 0;
                actionsPostErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
            it('should call next if filter is set in body', (done) => {
                let body = {
                    filter: ['senderId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                let nextCalled = 0;
                actionsPostErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
            it('should call next if delete is set in body', (done) => {
                let body = {
                    delete: ['senderId1']
                }
                let request = getRequest(body);
                let response = getResponse();
                let nextCalled = 0;
                actionsPostErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
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
                actionsPostErrors(request, response);
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
                actionsPostErrors(request, response);
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
                actionsPostErrors(request, response);
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
                actionsPostErrors(request, response);
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
                actionsPostErrors(request, response);                
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
                actionsPostErrors(request, response);                
            });
        });
});
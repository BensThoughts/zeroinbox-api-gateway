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

function getRequest(queryParams) {
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
        query: {
            ...queryParams
        }
    });
} 

function getResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

describe('statsController: ', () => {
    describe('stats: ', () => {
        let statsController;
        beforeEach(() => {
            statsController = require('../../stats.controller');
        });
        afterEach(() => {

        });
        it('should respond properly', (done) => {
            let queryParams = {
                    filter: 'thread_count',
                    stats: 'size'
            }
            const request = getRequest(queryParams);
            const response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(response._getStatusCode()).to.eql(200);
                expect(data.status).to.eql('success');
                done();
            });
            statsController.stats(request, response);
        });
        describe('query parameter checks', () => {
            it('should respond with an error if there are no query parameters sent', (done) => {
                const request = getRequest();
                const response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                statsController.stats(request, response);
            });
            it('should respond with an error if filter query is not sent', (done) => {
                let queryParams = {
                    stats: 'size'
                }
                const request = getRequest(queryParams);
                const response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                statsController.stats(request, response);
            });
            it('should respond with an error if stats query is not sent', (done) => {
                let queryParams = {
                    filter: 'thread_count'
                }
                const request = getRequest(queryParams);
                const response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                statsController.stats(request, response);
            });
            it('should respond with an error if filter query is not a correct value', (done) => {
                let queryParams = {
                    filter: 'threa',
                    stats: 'size'
                }
                const request = getRequest(queryParams);
                const response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                statsController.stats(request, response);
            });
            it('should respond with an error if stats query is not a correct value', (done) => {
                let queryParams = {
                    filter: 'thread_count',
                    stats: 'siz'
                }
                const request = getRequest(queryParams);
                const response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    expect(response._getStatusCode()).to.eql(400);
                    done();
                });
                statsController.stats(request, response);
            });
        });

    });
});
const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const chai = require('chai');
const expect = chai.expect;

let httpMocks = require('node-mocks-http');

const userId = 'user_id';
const emailId = 'email_id';
const emailAddress = 'test@gmail.com';
const tokenAddition = {
    accessToken: 'test_token',
    expiryDate: '1551501417831',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    tokenType: 'Bearer'
}

const cookie = 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF';

function getRequest(path, method, token) {
    return httpMocks.createRequest({
        method: method,
        path: path,
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
    });
} 

function getResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

describe('authErrors: ', () => {
        let authErrors;
        beforeEach(() => {
            authErrors = require('../../auth-errors');
        });
        afterEach(() => {

        });
        describe('Success responses', () => {
            it('should call next if path is /v1/oath2init and no token', (done) => {
                let path = '/v1/oauth2init';
                let method = 'GET';
                let request = getRequest(path, method);
                let response = getResponse();
                let nextCalled = 0;
                authErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
            it('should call next if path is /v1/oauth2callback and no token', (done) => {
                let path = '/v1/oauth2callback';
                let method = 'GET';
                let request = getRequest(path, method);
                let response = getResponse();
                let nextCalled = 0;
                authErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
            it('should call next on any other path as long as the token is set', (done) => {
                let path = '/anypath';
                let method = 'GET';
                let request = getRequest(path, method, tokenAddition);
                let response = getResponse();
                let nextCalled = 0;
                authErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
        });
        describe('Error responses: ', () => {
            it('should respond with an error if there is no token set on any other path', (done) => {
                let path = '/anypath';
                let method = 'GET';
                let request = getRequest(path, method);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    done();
                });
                authErrors(request, response);
            });
        });
});
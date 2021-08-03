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
const token = {
    accessToken: 'test_token',
    expiryDate: '1551501417831',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    tokenType: 'Bearer'
}

const cookie = 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF';

const user_info = {
    userId: userId,
    emailId: emailId,
    emailAddress: emailAddress
}

function getRequest(path, method, session) {
    return httpMocks.createRequest({
        method: method,
        path: path,
        session: session,
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

describe('emailIdErrors: ', () => {
        let emailIdErrors;
        beforeEach(() => {
            emailIdErrors = require('../../email-id-errors');
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
                emailIdErrors(request, response, () => {
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
                emailIdErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
            it('should call next if path is /v1/basicProfile and no token', (done) => {
                let path = '/v1/basicProfile';
                let method = 'GET';
                let request = getRequest(path, method);
                let response = getResponse();
                let nextCalled = 0;
                emailIdErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
            it('should call next on any other path as long as the session and user_info are set', (done) => {
                let path = '/anypath';
                let method = 'GET';
                const sessionWithUserInfo = {
                    token: token,
                    user_info: user_info
                }
                let request = getRequest(path, method, sessionWithUserInfo);
                let response = getResponse();
                let nextCalled = 0;
                emailIdErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
        });
        describe('Error responses: ', () => {
            it('should respond with an error if there is no user_info set on any other path', (done) => {
                let path = '/anypath';
                let method = 'GET';
                let session = {
                    token: token
                }
                let request = getRequest(path, method, session);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    done();
                });
                emailIdErrors(request, response);
            });
            it('should respond with an error if there is no userId set on any other path', (done) => {
                let path = '/anypath';
                let method = 'GET';
                let session = {
                    token: token,
                    user_info: {

                    }
                }
                let request = getRequest(path, method, session);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    done();
                });
                emailIdErrors(request, response);
            });
        });
});
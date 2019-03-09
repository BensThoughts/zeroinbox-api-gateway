const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const chai = require('chai');
const expect = chai.expect;

let httpMocks = require('node-mocks-http');

const cookie = 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF';



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

describe('sessionErrors: ', () => {
        let sessionErrors;
        beforeEach(() => {
            sessionErrors = require('../../session-errors');
        });
        afterEach(() => {

        });
        describe('Success responses', () => {
            it('should call next if req.session is accessible, exists', (done) => {
                let path = '/anypath';
                let method = 'GET';
                let session = {

                }
                let request = getRequest(path, method, session);
                let response = getResponse();
                let nextCalled = 0;
                sessionErrors(request, response, () => {
                    nextCalled += 1;
                    expect(nextCalled).to.eql(1);
                    done();
                });
            });
        });
        describe('Error responses: ', () => {
            it('should respond with an error if session is not accessible, does not exist', (done) => {
                let path = '/anypath';
                let method = 'GET';
                let request = getRequest(path, method);
                let response = getResponse();
                response.on('end', () => {
                    let data = JSON.parse(response._getData());
                    expect(data.status).to.eql('error');
                    done();
                });
                sessionErrors(request, response);
            });
        });
});
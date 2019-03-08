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
        beforeEach(() => {
            actionsController = require('../../actions.controller');
        });
        afterEach(() => {

        });
        it('should give a response if label is set in body', (done) => {
            let body = {
                label: ['senderId1']
            }
            let request = getRequest(body);
            let response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                console.log(data);
                console.log(response._getStatusCode());
                done();
            });
            actionsController.postActions(request, response);
        });
    });
});
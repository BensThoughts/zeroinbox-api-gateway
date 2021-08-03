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
    accessToken: 'test_token',
    expiryDate: '1551501417831',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    tokenType: 'Bearer'
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
        body: body
    });
} 

function getResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

let actionsController;

describe('actionsController: ', () => {
    beforeEach(() => {
        actionsController = require('../../actions.controller');
    });
    afterEach(() => {
        actionsController = undefined;
    });
    describe('success routes', () => {
        it('should give a response', (done) => {
            let body = {
                labelTasks: [
                    {
                        senderId: 'senderId1',
                        labelNames: ['senderName', 'Extra Large']
                    },
                    {
                        senderId: 'senderId2',
                        labelNames: ['Medium']
                    },
                    {
                        senderId: 'senderId3',
                        labelNames: ['senderName']
                    }
                ],
                deleteTasks: ['senderId4', 'senderId5', 'senderId6']
            }
            let request = getRequest(body);
            let response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                console.log(data);
                done();
            });
            actionsController.postActions(request, response);
        });
    });
});
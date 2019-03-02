const dotenv = require('dotenv').config();


const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
let mongoServer;



const userController = require('../../user.controller');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const nock = require('nock');

let httpMocks = require('node-mocks-http');

function getEmailRequest() {
    return httpMocks.createRequest({
        method: 'GET',
        url: '/v1/emailProfile',
        session: {
            token: {
                access_token: 'test_token',
                expiry_date: '1551501417831',
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
                token_type: 'Bearer'
            },
            user_info: {
                userId: '12345abc'
            }
        },
        headers: {
            cookie: 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF'
        }
    });
}

function getEmailResponse() {
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

function getBasicRequest() {
    return httpMocks.createRequest({
        method: 'GET',
        url: '/v1/basicProfile',
        session: {
            token: {
                access_token: 'test_token',
                expiry_date: '1551501417831',
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
                token_type: 'Bearer'
            }
        },
        headers: {
            cookie: 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF'
        }
    });
} 

function getBasicResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}


describe('userController:', () => {
    before(function(done) {
        let opts = { useNewUrlParser: true };
        mongoServer = new MongoMemoryServer();
        mongoServer.getConnectionString().then((mongoUri) => {
            return mongoose.connect(mongoUri, opts, (err) => {
                if (err) done(err);
            });
        }).then(() => done());
    });
    
    after(() => {
        mongoose.disconnect();
        mongoServer.stop();
    });

    describe('basic_profile: ', () => {
        describe('googleapi calls succeed', () => {
            beforeEach(() => {
                let basicFixture = require('../fixtures/basic_profile');
                nock('https://www.googleapis.com')
                .get('/oauth2/v2/userinfo')
                .reply(200, basicFixture);
            });
            it('should give a correct response', (done) => {
                let basicRequest = getBasicRequest();
                let basicResponse = getBasicResponse();
                userController.basic_profile(basicRequest, basicResponse);
                basicResponse.on('end', () => {
                    // console.log(basicRequest);
                    expect(basicRequest.session.user_info.userId).to.eql('115399687284834648545');
                    let response = JSON.parse(basicResponse._getData());
                    // console.log(response);
                    expect(response.status).to.eql('success');
                    expect(response.status_message).to.eql('OK');
                    let data = {
                        basic_profile:
                            { 
                                id: '115399687284834648545',
                                name: 'Benjamin Blumenfeld-Jones',
                                given_name: 'Benjamin',
                                family_name: 'Blumenfeld-Jones',
                                picture: 'https://lh6.googleusercontent.com/-6Y3E4VDti8U/AAAAAAAAAAI/AAAAAAAAAAk/WRupTfidlxg/photo.jpg',
                                locale: 'en' 
                            }
                    }
                    expect(response.data).to.eql(data);
                    done();
                });
            });
        });
        describe('googleapi calls fails', () => {
            beforeEach(() => {
                nock('https://www.googleapis.com')
                .get('/oauth2/v2/userinfo')
                .replyWithError({
                    message: 'error',
                    code: '500'
                });
            });
            it('should give an error response', (done) => {
                let basicRequest = getBasicRequest();
                let basicResponse = getBasicResponse();
                userController.basic_profile(basicRequest, basicResponse);
                basicResponse.on('end', () => {
                    let response = JSON.parse(basicResponse._getData());
                    expect(response.status).to.eql('error');
                    expect(response.status_message).to.eql('Google Api Error at /basicProfile: error contacting googleApi')
                    done();
                });
            });
        
        });
    });

    describe('email_profile: ', () => {
        describe('googleapi calls succeed', () => {
            beforeEach(() => {
                let emailFixture = require('../fixtures/email_profile');
                nock('https://www.googleapis.com')
                .get('/gmail/v1/users/me/profile')
                .reply(200, emailFixture);
            });
            it('should give a correct response', (done) => {
                let emailRequest = getEmailRequest();
                let emailResponse = getEmailResponse();
                userController.email_profile(emailRequest, emailResponse);
                emailResponse.on('end', () => {
                    let response = JSON.parse(emailResponse._getData());
                    // console.log(response);
                    expect(response.status).to.eql('success');
                    expect(response.status_message).to.eql('OK');
                    let data = {
                        email_profile:
                            { 
                                emailAddress: 'test@gmail.com',
                                messagesTotal: 1000,
                                threadsTotal: 700,
                                historyId: '12345abc' 
                            }
                    }
                    expect(response.data).to.eql(data);
                    done();
                });
            });
        });
        describe('googleapi calls fails', () => {
            beforeEach(() => {
                nock('https://www.googleapis.com')
                .get('/gmail/v1/users/me/profile')
                .replyWithError({
                    message : 'error', 
                    code: '500'
                });
            });
            it('should give an error response', (done) => {
                let emailRequest = getEmailRequest();
                let emailResponse = getEmailResponse();
                userController.email_profile(emailRequest, emailResponse);
                emailResponse.on('end', () => {
                    let response = JSON.parse(emailResponse._getData());
                    expect(response.status).to.eql('error');
                    expect(response.status_message).to.eql('Google Api Error at /emailProfile: error contacting googleApi')
                    done();
                });

            });
        });
    });

});
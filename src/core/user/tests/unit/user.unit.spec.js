const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
let mongoServer;

const Profile = require('../../../models/profile.model');

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

    


    describe('basic_profile: ', () => {
        describe('googleapi calls succeed', () => {
            before(function(done) {
                let opts = { useNewUrlParser: true };
                mongoServer = new MongoMemoryServer();
                mongoServer.getConnectionString().then((mongoUri) => {
                    return mongoose.connect(mongoUri, opts, (err) => {
                        if (err) done(err);
                    });
                }).then(() => done());
            });
            before(() => {
                let basicFixture = require('../fixtures/basic_profile');
                nock('https://www.googleapis.com')
                .get('/oauth2/v2/userinfo')
                .times(2)
                .reply(200, basicFixture);
            });
            after(() => {
                nock.cleanAll();
                mongoose.disconnect();
                mongoServer.stop();
            });
            it('should give a correct response', (done) => {
                let basicRequest = getBasicRequest();
                let basicResponse = getBasicResponse();
                userController.basic_profile(basicRequest, basicResponse);
                basicResponse.on('end', () => {
                    // console.log(basicRequest);
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
            it('should set the request session object with the userId', (done) => {
                let basicRequest = getBasicRequest();
                let basicResponse = getBasicResponse();
                userController.basic_profile(basicRequest, basicResponse);
                basicResponse.on('end', () => {
                    // console.log(basicRequest);
                    expect(basicRequest.session.user_info.userId).to.eql('115399687284834648545');
                    done();
                });
            });
        });
        describe('googleapi calls fails', () => {
            before(() => {
                nock('https://www.googleapis.com')
                .get('/oauth2/v2/userinfo')
                .times(3)
                .replyWithError({
                    message: 'error',
                    code: '500'
                });
            });
            before((done) => {
                let opts = { useNewUrlParser: true };
                mongoServer = new MongoMemoryServer();
                mongoServer.getConnectionString().then((mongoUri) => {
                    return mongoose.connect(mongoUri, opts, (err) => {
                        if (err) done(err);
                    });
                }).then(() => done());
            });
            after(() => {
                nock.cleanAll();
                mongoose.disconnect();
                mongoServer.stop();
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
            let emailRequest;
            let emailResponse;
            before(() => {
                let emailFixture = require('../fixtures/email_profile');
                nock('https://www.googleapis.com')
                .get('/gmail/v1/users/me/profile')
                .times(4)
                .reply(200, emailFixture);
            });
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
                nock.cleanAll();
                mongoose.disconnect();
                mongoServer.stop();
            });
            it('should give a correct response', (done) => {
                emailRequest = getEmailRequest();
                emailResponse = getEmailResponse();
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
            it ('should set the session emailAddress', (done) => {
                emailRequest = getEmailRequest();
                emailResponse = getEmailResponse();
                userController.email_profile(emailRequest, emailResponse);
                emailResponse.on('end', () => {
                    // let response = JSON.parse(emailResponse._getData());
                    expect(emailRequest.session.user_info.emailAddress).to.eql('test@gmail.com')
                    done();
                });
            });
            it('should set the session emailId to the md5 hex of the emailAddress', (done) => {
                emailRequest = getEmailRequest();
                emailResponse = getEmailResponse();
                userController.email_profile(emailRequest, emailResponse);
                emailResponse.on('end', () => {
                    let response = JSON.parse(emailResponse._getData());
                    expect(emailRequest.session.user_info.emailId).to.eql('1aedb8d9dc4751e229a335e371db8058')
                    done();
                });
            });
            it('should upload the email profile to MongoDB', (done) => {
                emailRequest = getEmailRequest();
                emailResponse = getEmailResponse();
                userController.email_profile(emailRequest, emailResponse);
                emailResponse.on('end', () => {
                    let response = JSON.parse(emailResponse._getData());
                    let conditions = { userId: emailRequest.session.user_info.userId };
                    let findFunc = function() {
                        Profile.findOne(conditions, (err, doc) => {
                            expect(doc.email.emailId).to.eql('1aedb8d9dc4751e229a335e371db8058');
                            expect(doc.email.emailAddress).to.eql('test@gmail.com');
                            expect(doc.email.messagesTotal).to.eql(1000);
                            expect(doc.email.threadsTotal).to.eql(700);
                            expect(doc.email.historyId).to.eql('12345abc');
                            done();
                        });
                    }
                    setTimeout(findFunc, 50);
                });
            });
        });
        describe('googleapi calls fails', () => {
            before(() => {
                nock('https://www.googleapis.com')
                .get('/gmail/v1/users/me/profile')
                .times(1)
                .replyWithError({
                    message : 'error', 
                    code: '500'
                });
            });
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
                nock.cleanAll();
                mongoose.disconnect();
                mongoServer.stop();
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
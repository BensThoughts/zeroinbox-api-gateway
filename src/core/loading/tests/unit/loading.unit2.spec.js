const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

const chai = require('chai');
const expect = chai.expect;

let httpMocks = require('node-mocks-http');
const td = require('testdouble');

const userId = 'user_id';

function getRequest() {
    return httpMocks.createRequest({
        method: 'GET',
        url: '/v1/basicProfile',
        session: {
            token: {
                access_token: 'test_token',
                expiry_date: '1551501417831',
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
                token_type: 'Bearer'
            },
            user_info: {
                userId: userId,
                emailId: '54321cba',
                emailAddress: 'test@gmail.com'
            }
        },
        headers: {
            cookie: 'connect.sid=s%3An6CClgs-7_2Sy82NG5N91iQj.GaVqQIA06eMWJbaDoZrmnMaqc4rmF'
        }
    });
} 

function getResponse(){
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

let loadingController; // = require('../../loading.controller');

describe('loadingController:', () => {


    describe('first_run_status: ', () => {
        let upsertToHistory;
        let findOneHistory;
        beforeEach(() => {
            let mongooseUtils = td.replace('../../../../libs/utils/mongoose.utils');
            upsertToHistory = mongooseUtils.upsertToHistory;
            findOneHistory = mongooseUtils.findOneHistory;
            loadingController = require('../../loading.controller');
        });
        afterEach(() => {
            td.reset();
            loadingController = undefined;
        });
        it('should return firstRun: true if it is not already set in History', (done) => {
            td.when(findOneHistory(userId)).thenCallback(null, null);
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('success');
                expect(data.status_message).to.eql('OK');
                expect(data.data.firstRun).to.eql(true);
                done();
            });
            loadingController.first_run_status(request, response);
        });
        it('should return firsRun: false if it is set in History DB to false', (done) => {
            td.when(findOneHistory(userId)).thenCallback(null, {
                passive: {
                    firstRun: false
                }
            });
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('success');
                expect(data.status_message).to.eql('OK');
                expect(data.data.firstRun).to.eql(false);
                done();
            });
            loadingController.first_run_status(request, response);
        });
        it('should return firsRun: true if it is set in History DB to true', (done) => {
            td.when(findOneHistory(userId)).thenCallback(null, {
                passive: {
                    firstRun: true
                }
            });
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('success');
                expect(data.status_message).to.eql('OK');
                expect(data.data.firstRun).to.eql(true);
                done();
            });
            loadingController.first_run_status(request, response);
        });
        it('should return the proper error message if the DB find throws an error', (done) => {
            td.when(findOneHistory(userId)).thenCallback('Error', null);
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let data = JSON.parse(response._getData());
                expect(data.status).to.eql('error');
                done();
            });
            loadingController.first_run_status(request, response); 
        });
        it('should call upsertToHistory() with the proper arguments on firstRunEver', (done) => {
            td.when(findOneHistory(userId)).thenCallback(null, null);
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let explanation = td.explain(upsertToHistory);
                expect(explanation.callCount).to.eql(1);
                expect(explanation.calls[0].args[0]).to.eql(userId);
                expect(explanation.calls[0].args[1]['passive.firstRun']).to.eql(true);
                expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.be.a('Date');
                let lastRunDate = explanation.calls[0].args[1]['passive.lastRunDate'];
                expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.eql(lastRunDate);
                done();
            });
            loadingController.first_run_status(request, response); 
        });
        it('should call upsertToHistory() with the proper arguments on run where firstRun is false', (done) => {
            td.when(findOneHistory(userId)).thenCallback(null, {
                passive: {
                    firstRun: false,
                    firstRunDate: new Date(),
                    lastRunDate: new Date()
                }
            });
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let explanation = td.explain(upsertToHistory);
                expect(explanation.callCount).to.eql(1);
                expect(explanation.calls[0].args[0]).to.eql(userId);
                expect(explanation.calls[0].args[1]['passive.firstRun']).to.not.exist;
                expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.not.exist;
                expect(explanation.calls[0].args[1]['passive.lastRunDate']).to.be.a('Date');
                done();
            });
            loadingController.first_run_status(request, response); 
        });
        it('should call upsertToHistory() with the proper arguments on run where firstRun is true', (done) => {
            td.when(findOneHistory(userId)).thenCallback(null, {
                passive: {
                    firstRun: true,
                    firstRunDate: new Date(),
                    lastRunDate: new Date()
                }
            });
            let request = getRequest();
            let response = getResponse();
            response.on('end', () => {
                let explanation = td.explain(upsertToHistory);
                expect(explanation.callCount).to.eql(1);
                expect(explanation.calls[0].args[0]).to.eql(userId);
                expect(explanation.calls[0].args[1]['passive.firstRun']).to.not.exist;
                expect(explanation.calls[0].args[1]['passive.firstRunDate']).to.not.exist;
                expect(explanation.calls[0].args[1]['passive.lastRunDate']).to.be.a('Date');
                done();
            });
            loadingController.first_run_status(request, response); 
        });
    });

});

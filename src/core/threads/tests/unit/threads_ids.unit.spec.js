process.env.NODE_ENV = 'test';

const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
// const assert = chai.assert();
const expect = chai.expect;

const request = require('request');


const threadsRouter = require('../../threads.routes');

const threads_ids = require('../../threads_ids.controller');
const ThreadId = require('../../../models/thread_IDs.model');

describe('controllers: threads_ids', function() {


    describe('static methods:', () => {
        it('should have createOptions', () => {
            expect(threads_ids.createOptions).to.exist;
        })
        
        it('should create options with no pageToken', () => {
            let options = threads_ids.createOptions('access_token');
            expect(options).to.exist;
            expect(options).to.have.keys('url', 'headers', 'qs');
            expect(options.url).to.equal('https://www.googleapis.com/gmail/v1/users/me/threads');

            let headers = options.headers;
            expect(headers).to.have.property('Authorization');
            expect(headers.Authorization).to.equal('Bearer access_token');
            
            let qs = options.qs;
            expect(qs).to.have.keys('maxResults', 'labelIds');
            expect(qs.labelIds).to.equal('INBOX');
            expect(qs.maxResults).to.equal(500);
        });

        it('should create options with pageToken', () => {
            let options = threads_ids.createOptions('access_token', 'pageToken');
            expect(options).to.exist;
            expect(options).to.have.keys('url', 'headers', 'qs');
            expect(options.url).to.equal('https://www.googleapis.com/gmail/v1/users/me/threads');

            let headers = options.headers;
            expect(headers).to.have.property('Authorization');
            expect(headers.Authorization).to.equal('Bearer access_token');
            
            let qs = options.qs;
            expect(qs).to.have.keys('pageToken', 'maxResults', 'labelIds');
            expect(qs.maxResults).to.equal(500);
            expect(qs.labelIds).to.equal('INBOX');
            expect(qs.pageToken).to.equal('pageToken');
        });
  

        it('should have createThreadId', () => {
            expect(threads_ids.createThreadId).to.exist;
        })
        it('should create a new ThreadId', (done) => {
            let threadId = threads_ids.createThreadId('threadId', 'userId');
            // console.log(threadId);
            expect(threadId).to.be.an('object');
            expect(threadId).to.have.property('validate');
            threadId.validate((err) => {
                expect(err).not.to.exist;
                done();
            })
        })

    });

    describe('classes:', () => {
        it('should have ThreadIdsResult', () => {
            expect(threads_ids.ThreadIdsResults).to.exist;
        })
    });
});


process.env.NODE_ENV = 'test';

const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
// const assert = chai.assert();
const expect = chai.expect;

const request = require('request');


const threadsRouter = require('../../threads.routes');

const threads_ids = require('../../threads_ids.controller');

describe('routes: threads_ids', function() {


    describe('threads_ids createOptions', () => {
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
        })
    });

})

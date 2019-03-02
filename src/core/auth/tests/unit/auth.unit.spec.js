process.env.NODE_ENV = 'test';

const chai = require('chai');
const sinon = require('sinon');
const should = chai.should();
// const assert = chai.assert();
const expect = chai.expect();

const request = require('request');

const base = 'http://127.0.0.1:8080'

const authUrlResponse = require('../fixtures/authUrl.json');

describe('routes: auth', function() {

    describe.skip('unstubbed', () => {
        describe('GET /oath2init', () => {
            it('should return an auth_url', (done) => {
                request.get(`${base}/oauth2init`, (err, res, body) => {
                    res.statusCode.should.eql(200);
                    res.headers['content-type'].should.contain('application/json');
                    body = JSON.parse(body);
                    // the JSON response body should have a
                    // key-value pair of {"status": "success" }
                    body.status.should.eql('success');

                    body.data.auth_url.should.be.a('string');
                    body.data.auth_url.should.contain('oauth2callback');
                    body.data.auth_url.should.contain('response_type=code')
                    body.data.auth_url.should.contain('gmail')
                    body.data.auth_url.should.contain('https://accounts.google.com/o/oauth2/v2/auth')
                    //body.authUrl.should.be.a('string');
                    done();
                })
            })
        });
    });

    describe('stubbed', () => {
        beforeEach(() => {
            this.get = sinon.stub(request, 'get');
        });

        afterEach(() => {
            request.get.restore();
        });

        describe('GET /oath2init', () => {
            it('should return an auth-url', (done) => {
                this.get.yields(
                    null, 
                    authUrlResponse.all.success.res, 
                    JSON.stringify(authUrlResponse.all.success.body)
                );
                request.get(`${base}/oauth2init`, (err, res, body) => {
                    res.statusCode.should.eql(200);
                    // the response should be JSON
                    res.headers['content-type'].should.contain('application/json');
                    // parse response body
                    body = JSON.parse(body);
                    // the JSON response body should have a
                    // key-value pair of {"status": "success"}
                    body.status.should.eql('success');

                    body.data.auth_url.should.be.a('string');
                    body.data.auth_url.should.contain('oauth2callback');
                    body.data.auth_url.should.contain('response_type=code')
                    body.data.auth_url.should.contain('gmail')
                    body.data.auth_url.should.contain('https://accounts.google.com/o/oauth2/v2/auth')

                    done();
                });
            });
        })

    
    });




})

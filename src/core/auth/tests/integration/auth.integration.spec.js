const dotenv = require('dotenv').config();

const supertest = require('supertest');
const googleApi = require('../../../../index');
const chai = require('chai');
const should = chai.should();

describe('routes: auth - supertest', function() {

    it('responds with auth_url', (done) => {
        supertest(googleApi)
            .get('/oauth2init')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                // res.statusCode.should.eql(200);
                res.headers['content-type'].should.contain('application/json');
                let body = res.body;
                body.status.should.eql('success');
                body.data.auth_url.should.be.a('string');
                body.data.auth_url.should.contain('oauth2callback');
                body.data.auth_url.should.contain('response_type=code')
                body.data.auth_url.should.contain('gmail')
                body.data.auth_url.should.contain('https://accounts.google.com/o/oauth2/v2/auth')
                done();
            })
    })
})
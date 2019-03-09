const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

var expect = require('chai').expect;

const Suggestion = require('../../suggestion.model');

describe('models: suggestion', function() {
    it('should be invalid if there is no data', (done) => {
        let suggestion = new Suggestion();
 
        suggestion.validate(function(err) {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if userId is missing', (done) => {
        let suggestion = new Suggestion({
            senderId: 'senderId',
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if senderId is missing', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be valid if both userId and senderId exist', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            senderId: 'senderId',
        });
        suggestion.validate((err) => {
            expect(err).to.not.exist;
            done();
        });
    });
});
var expect = require('chai').expect;
 
var ThreadId = require('../../thread_IDs.model');
 
describe('models: threadId', function() {
    it('should be invalid if new ThreadId() is empty', function(done) {
        var threadId = new ThreadId();
 
        threadId.validate(function(err) {
            expect(err.errors).to.exist;
            done();
        });
    });

    it('should be invalid if new ThreadId() is missing userId', function(done) {
        var threadId = new ThreadId({
            threadId: 'threadId'
        });
 
        threadId.validate(function(err) {
            expect(err.errors).to.exist;
            done();
        });
    });

    it('should be invalid if new ThreadId() is missing threadId', function(done) {
        var threadId = new ThreadId({
            userId: 'userId'
        });
 
        threadId.validate(function(err) {
            expect(err.errors).to.exist;
            done();
        });
    });

    it('should be valid if new ThreadId() has userId and threadId', function(done) {
        var threadId = new ThreadId({
            userId: 'userId',
            threadId: 'threadId'
        });
 
        threadId.validate(function(err) {
            expect(err).not.to.exist;
            done();
        });
    });
});
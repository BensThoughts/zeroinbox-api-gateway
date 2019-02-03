var expect = require('chai').expect;
const crypto = require('crypto'); 

const Suggestion = require('../../suggestion.model');

let create_senderId = function(senderAddress) {
    let md5sum = crypto.createHash('md5');
    md5sum.update(senderAddress);
  
    let id = md5sum.digest('hex');
    // this.senderId = id;
    return id;
}

let valid_suggestion = function() {
    let senderId = Suggestion.createSenderId('senderAddress');
    return new Suggestion({
        userId: 'userId',
        emailAddress: 'emailAddress',
        emailId: 'emailId',
        senderId: senderId,
        senderNames: ['fromName'],
        senderAddress: 'senderAddress',
        threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
        totalSizeEstimate: 123456,
        count: 1
    });
}

const senderId = create_senderId('senderAddress');

describe('models: suggestion', function() {
    it('should be invalid if new Suggestion() is empty', function(done) {
        let suggestion = new Suggestion();
 
        suggestion.validate(function(err) {
            // console.log(err);
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing userId', (done) => {
        let suggestion = new Suggestion({
            // userId: 'userId',
            senderId: senderId,
            senderNames: ['fromNames'],
            senderAddress: 'senderAddress',
            threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            totalSizeEstimate: 123456,
            count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing senderId', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            // senderId: 'senderId',
            senderNames: ['fromNames'],
            senderAddress: 'senderAddress',
            threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            totalSizeEstimate: 123456,
            count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing senderNames', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            senderId: senderId,
            // senderNames: ['fromNames'],
            senderAddress: 'senderAddress',
            threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            totalSizeEstimate: 123456,
            count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing senderAddress', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            senderId: senderId,
            senderNames: ['fromNames'],
            // senderAddress: 'senderAddress',
            threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            totalSizeEstimate: 123456,
            count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing threadIds_internalDates', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            senderId: senderId,
            senderNames: ['fromNames'],
            senderAddress: 'senderAddress',
            // threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            totalSizeEstimate: 123456,
            count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing totalSizeEstimate', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            senderId: senderId,
            senderNames: ['fromNames'],
            senderAddress: 'senderAddress',
            threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            // totalSizeEstimate: 123456,
            count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Suggestion() is missing count', (done) => {
        let suggestion = new Suggestion({
            userId: 'userId',
            senderId: senderId,
            senderNames: ['fromNames'],
            senderAddress: 'senderAddress',
            threadIds_internalDates: [{ threadId: 'threadId', internalDate: 123456 }],
            totalSizeEstimate: 123456,
            // count: 1
        });
        suggestion.validate((err) => {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be valid if new Suggestion() has all required properties', function(done) {
        let suggestion = valid_suggestion();
        suggestion.validate(function(err) {
            // console.log(err);
            expect(err).not.to.exist;
            done();
        });
    });


    describe('methods:', () => {
        it('should have addOneToCount', () => {
            let suggestion = valid_suggestion();
            suggestion.should.have.property('addOneToCount');
        });
        it('addOneToCount should add one to count', () => {
            let suggestion = valid_suggestion();        
            suggestion.addOneToCount();
            expect(suggestion.count).to.equal(2);
            expect(suggestion.totalSizeEstimate).to.eql(123456);
        });
        it('should have concatNames', () => {
            let suggestion = valid_suggestion();
            suggestion.should.have.property('concatNames');
        });
        it('concatNames should concat a new names', () => {
            let suggestion = valid_suggestion();
            expect(suggestion.senderNames).to.eql(['fromName']);
            suggestion.concatNames('newName');
            expect(suggestion.senderNames).to.eql(['fromName', 'newName']);
        });
        it('should have concatThreadIds_internalDates', () => {
            let suggestion = valid_suggestion();
            suggestion.should.have.property('concatThreadIds_internalDates');
        });
        it('concatThreadIds_internalDates should concat new threadIds_internalDates', () => {
            let suggestion = valid_suggestion();
            suggestion.concatThreadIds_internalDates([
                { threadId: 'newThreadId', internalDate: 654321 },
                { threadId: 'newThreadId2', internalDate: 55555 }    
            ]);
            suggestion.validate((err) => {
                expect(err).not.to.exist;
            })
            let newArray = suggestion.get('threadIds_internalDates');
            expect(newArray.length).to.eql(3);
        });
        it('should have addToTotalSizeEstimate', () => {
            let suggestion = valid_suggestion();
            suggestion.should.have.property('addToTotalSizeEstimate');
        });
        it('addToTotalSizeEstimate should add to totalSizeEstimate', () => {
            let suggestion = valid_suggestion();
            suggestion.addToTotalSizeEstimate(1234);
            expect(suggestion.totalSizeEstimate).to.eql(124690);
            expect(suggestion.count).to.eql(1);
        });
    });

    describe('static methods:', () => {
        it('should have createSenderId', () => {
            let suggestion = valid_suggestion();
            Suggestion.should.have.property('createSenderId');
        });
        it('createSenderId should create id as hex with md5 hash', () => {
            let suggestion = valid_suggestion();
            let id = create_senderId('senderAddress');
            expect(suggestion.senderId).to.eql(id);
        })
    });

});


const dotenv = require('dotenv').config();

if (dotenv.error) {
    throw dotenv.error;
}

var expect = require('chai').expect;
const crypto = require('crypto'); 

const Sender = require('../../sender.model');

let create_senderId = function(senderAddress) {
    let md5sum = crypto.createHash('md5');
    md5sum.update(senderAddress);
  
    let id = md5sum.digest('hex');
    // this.senderId = id;
    return id;
}

let valid_suggestion = function() {
    let senderId = Sender.createSenderId('senderAddress');
    return new Sender({
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

describe('models: sender', function() {
    it('should be invalid if new Sender() is empty', function(done) {
        let suggestion = new Sender();
 
        suggestion.validate(function(err) {
            expect(err.errors).to.exist;
            done();
        });
    });
    it('should be invalid if new Sender() is missing userId', (done) => {
        let suggestion = new Sender({
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
    it('should be invalid if new Sender() is missing senderId', (done) => {
        let suggestion = new Sender({
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
    it('should be invalid if new Sender() is missing senderNames', (done) => {
        let suggestion = new Sender({
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
    it('should be invalid if new Sender() is missing senderAddress', (done) => {
        let suggestion = new Sender({
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
    it('should be invalid if new Sender() is missing threadIds_internalDates', (done) => {
        let suggestion = new Sender({
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
    it('should be invalid if new Sender() is missing totalSizeEstimate', (done) => {
        let suggestion = new Sender({
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
    it('should be invalid if new Sender() is missing count', (done) => {
        let suggestion = new Sender({
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
    it('should be valid if new Sender() has all required properties', function(done) {
        let suggestion = valid_suggestion();
        suggestion.validate(function(err) {
            expect(err).not.to.exist;
            done();
        });
    });

    describe('static methods:', () => {
        it('should have createSenderId', () => {
            let suggestion = valid_suggestion();
            expect(Sender).to.have.property('createSenderId');
        });
        it('createSenderId should create id as md5 hash in hex decimal', () => {
            let suggestion = valid_suggestion();
            let id = create_senderId('senderAddress');
            expect(suggestion.senderId).to.eql(id);
        })
    });

});

